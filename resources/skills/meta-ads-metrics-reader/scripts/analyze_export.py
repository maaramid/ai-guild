#!/usr/bin/env python3
"""Normalize a Meta Ads Manager export and compute the numbers that matter.

Usage:
    python analyze_export.py <export.csv|export.xlsx> [--level ad|adset|campaign]
                             [--target-cpa N] [--target-roas N] [--json out.json]

Reads the CSV/XLSX that Ads Manager produces (any language column headers it
recognises are mapped; unknown columns are ignored), groups rows at the chosen
level, recomputes the derived metrics from raw totals (never averages ratios),
and prints Markdown tables plus automatic flags. Standard library only; XLSX
needs openpyxl (falls back to asking for CSV).
"""
import argparse
import csv
import json
import re
import sys
from collections import OrderedDict

# canonical key -> regexes matched against the lower-cased header
COLUMNS = OrderedDict([
    ("campaign", [r"^campaign name$", r"^campaign$"]),
    ("adset", [r"^ad set name$", r"^ad set$"]),
    ("ad", [r"^ad name$", r"^ad$"]),
    ("delivery", [r"delivery( status)?$"]),
    ("result_type", [r"^result (indicator|type)$"]),
    ("results", [r"^results$"]),
    ("spend", [r"^amount spent"]),
    ("impressions", [r"^impressions$"]),
    ("reach", [r"^reach$"]),
    ("link_clicks", [r"^link clicks$"]),
    ("clicks_all", [r"^clicks \(all\)$"]),
    ("lpv", [r"^landing page views$", r"^website landing page views$"]),
    ("atc", [r"^adds to cart$", r"^website adds to cart$"]),
    ("checkouts", [r"^checkouts initiated$", r"^website checkouts initiated$"]),
    ("purchases", [r"^purchases$", r"^website purchases$"]),
    ("purchase_value", [r"^purchases conversion value$", r"^website purchases conversion value$",
                        r"^purchase conversion value$"]),
    ("messages", [r"messaging conversations started"]),
    ("leads", [r"^leads$", r"^on-facebook leads$", r"^website leads$"]),
    ("video_3s", [r"^3-second video plays$", r"^video plays at 3 seconds"]),
    ("thruplays", [r"^thruplays$"]),
    ("start", [r"^reporting starts$"]),
    ("end", [r"^reporting ends$"]),
])

SUM_KEYS = ["results", "spend", "impressions", "reach", "link_clicks", "clicks_all", "lpv", "atc",
            "checkouts", "purchases", "purchase_value", "messages", "leads", "video_3s", "thruplays"]


def to_num(v):
    if v is None:
        return 0.0
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip()
    if s in ("", "-", "—", "–", "N/A", "n/a"):
        return 0.0
    s = re.sub(r"[^\d.\-]", "", s.replace(",", ""))
    try:
        return float(s) if s not in ("", "-", ".") else 0.0
    except ValueError:
        return 0.0


def read_rows(path):
    if path.lower().endswith((".xlsx", ".xlsm")):
        try:
            import openpyxl  # type: ignore
        except ImportError:
            sys.exit("XLSX needs openpyxl (pip install openpyxl) - or export the report as CSV instead.")
        wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
        ws = wb.active
        it = ws.iter_rows(values_only=True)
        header = [str(h or "").strip() for h in next(it)]
        return header, [dict(zip(header, r)) for r in it]
    for enc in ("utf-8-sig", "utf-16", "cp1252"):
        try:
            with open(path, newline="", encoding=enc) as f:
                sample = f.read(4096)
                f.seek(0)
                try:
                    dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
                except csv.Error:
                    dialect = csv.excel
                reader = csv.DictReader(f, dialect=dialect)
                rows = list(reader)
                return [h.strip() for h in (reader.fieldnames or [])], rows
        except UnicodeError:
            continue
    sys.exit("Could not read the file's text encoding - re-export it as CSV.")


def map_headers(header):
    mapping, currency = {}, None
    for h in header:
        low = h.lower().strip()
        for key, pats in COLUMNS.items():
            if key in mapping.values():
                continue
            if any(re.search(p, low) for p in pats):
                mapping[h] = key
                if key == "spend":
                    m = re.search(r"\(([A-Z]{3})\)", h)
                    currency = m.group(1) if m else None
                break
    return mapping, currency


def derive(t):
    def div(a, b, mult=1.0):
        return (a / b * mult) if b else None
    conv = t["purchases"] or t["leads"] or t["messages"] or t["results"]
    return {
        # reach is not additive: only trust frequency for a single source row
        "frequency": div(t["impressions"], t["reach"]) if t.get("_rows", 1) == 1 else None,
        "ctr_link_%": div(t["link_clicks"], t["impressions"], 100),
        "cpc_link": div(t["spend"], t["link_clicks"]),
        "cpm": div(t["spend"], t["impressions"], 1000),
        "cost_per_result": div(t["spend"], t["results"]),
        "cpa_purchase": div(t["spend"], t["purchases"]),
        "cost_per_lead": div(t["spend"], t["leads"]),
        "cost_per_message": div(t["spend"], t["messages"]),
        "roas": div(t["purchase_value"], t["spend"]),
        "aov": div(t["purchase_value"], t["purchases"]),
        "hook_rate_%": div(t["video_3s"], t["impressions"], 100) if t["video_3s"] else None,
        "hold_rate_%": div(t["thruplays"], t["video_3s"], 100),
        "click_to_lpv_%": div(t["lpv"], t["link_clicks"], 100),
        "lpv_to_atc_%": div(t["atc"], t["lpv"], 100),
        "atc_to_purchase_%": div(t["purchases"], t["atc"], 100),
        "click_to_conversion_%": div(conv, t["link_clicks"], 100),
    }


def fmt(v, digits=2):
    if v is None:
        return "-"
    if abs(v) >= 1000:
        return f"{v:,.0f}"
    return f"{v:,.{digits}f}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--level", choices=["ad", "adset", "campaign"], default=None)
    ap.add_argument("--target-cpa", type=float, default=None)
    ap.add_argument("--target-roas", type=float, default=None)
    ap.add_argument("--json", default=None)
    a = ap.parse_args()
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # Windows consoles default to cp1252
    except (AttributeError, ValueError):
        pass

    header, rows = read_rows(a.file)
    mapping, currency = map_headers(header)
    found = set(mapping.values())
    level = a.level or ("ad" if "ad" in found else "adset" if "adset" in found else
                        "campaign" if "campaign" in found else None)

    groups = OrderedDict()
    period = set()
    for r in rows:
        rec = {mapping[h]: v for h, v in r.items() if h in mapping}
        name_parts = [str(rec.get(k) or "").strip() for k in ("campaign", "adset", "ad")
                      if k in found and (level is None or ["campaign", "adset", "ad"].index(k)
                                         <= ["campaign", "adset", "ad"].index(level))]
        has_names = any(k in found for k in ("campaign", "adset", "ad"))
        name = " › ".join(p for p in name_parts if p)
        if (has_names and not name) or name.lower().startswith("total") \
                or not any(to_num(rec.get(k)) for k in SUM_KEYS):
            continue  # skip Ads Manager summary rows (blank names) and empty lines
        name = name or "(all rows)"
        g = groups.setdefault(name, {k: 0.0 for k in SUM_KEYS} | {"result_type": set(), "_rows": 0})
        g["_rows"] += 1
        for k in SUM_KEYS:
            g[k] += to_num(rec.get(k))
        if rec.get("result_type"):
            g["result_type"].add(str(rec["result_type"]))
        if rec.get("start") or rec.get("end"):
            period.add((str(rec.get("start") or ""), str(rec.get("end") or "")))

    if not groups:
        sys.exit("No data rows recognised. Recognised columns: " + ", ".join(sorted(found)))

    total = {k: sum(g[k] for g in groups.values()) for k in SUM_KEYS}
    total["_rows"] = sum(g["_rows"] for g in groups.values())
    out = {"currency": currency, "level": level, "period": sorted(period),
           "columns_found": sorted(found),
           "columns_missing": [k for k in COLUMNS if k not in found],
           "total": total | derive(total), "rows": []}

    cur = currency or ""
    print(f"# Export summary ({cur})  level={level}")
    if period:
        print("Period:", "; ".join(f"{s} → {e}" for s, e in sorted(period)))
    print("Missing columns (add them to the export for a fuller read):",
          ", ".join(out["columns_missing"]) or "none")
    t = out["total"]
    print("\n## Account totals")
    for k in ["spend", "impressions", "reach", "frequency", "link_clicks", "ctr_link_%", "cpc_link", "cpm",
              "results", "cost_per_result", "purchases", "cpa_purchase", "purchase_value", "roas", "leads",
              "cost_per_lead", "messages", "cost_per_message", "hook_rate_%", "hold_rate_%",
              "click_to_lpv_%", "lpv_to_atc_%", "atc_to_purchase_%"]:
        if k == "reach" and t["_rows"] > 1:
            continue  # summed reach double-counts people seen by several ads
        if t.get(k):
            print(f"- {k}: {fmt(t[k])}")

    cols = ["spend", "results", "cost_per_result", "roas", "ctr_link_%", "cpm", "frequency", "hook_rate_%",
            "hold_rate_%"]
    print(f"\n## By {level} (sorted by spend)")
    print("| Name | " + " | ".join(cols) + " | Flags |")
    print("|---|" + "---|" * (len(cols) + 1))
    avg_cpr = t.get("cost_per_result")
    for name, g in sorted(groups.items(), key=lambda kv: -kv[1]["spend"]):
        d = g | derive(g)
        flags = []
        target = a.target_cpa or avg_cpr
        if g["impressions"] < 1000 or (target and g["spend"] < 3 * target and g["results"] < 3):
            flags.append("low data")
        if g["spend"] > 0 and g["results"] == 0 and target and g["spend"] >= 2 * target:
            flags.append("spend, no results")
        if a.target_cpa and d["cost_per_result"] and d["cost_per_result"] > 1.5 * a.target_cpa:
            flags.append("CPA >1.5x target")
        if a.target_roas and d["roas"] is not None and g["spend"] > 0 and d["roas"] < a.target_roas:
            flags.append("ROAS below target")
        if d["frequency"] and d["frequency"] > 3.5:
            flags.append("high frequency")
        if d["ctr_link_%"] is not None and g["impressions"] >= 1000 and d["ctr_link_%"] < 0.7:
            flags.append("low CTR")
        if d["hook_rate_%"] is not None and g["video_3s"] and d["hook_rate_%"] < 20:
            flags.append("weak hook")
        d.pop("result_type", None)
        d.pop("_rows", None)
        out["rows"].append({"name": name, "flags": flags} | {k: v for k, v in d.items()})
        print(f"| {name} | " + " | ".join(fmt(d.get(c)) for c in cols) + f" | {', '.join(flags)} |")

    share_dead = sum(r["spend"] for r in out["rows"] if "spend, no results" in r["flags"])
    if total["spend"]:
        print(f"\nSpend on rows flagged 'spend, no results': {fmt(share_dead)} "
              f"({share_dead / total['spend'] * 100:.1f}% of total)")
    print("\nReach and frequency are left out wherever rows were combined (reach can't be added up "
          "across ads); export at that level to see them.")
    print("Flags use rough thresholds; judge against the account's own history and targets.")

    if a.json:
        with open(a.json, "w", encoding="utf-8") as f:
            json.dump(out, f, indent=2, default=list)
        print(f"\nJSON written to {a.json}")


if __name__ == "__main__":
    main()
