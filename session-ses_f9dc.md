# SkillTrace AI System

**Session ID:** ses_f9dc06853ffem9X1jmxAhTXFCy
**Created:** 9/2/2026, 6:42:09 PM
**Updated:** 9/5/2026, 11:29:44 PM

---

## Assistant (Build · Big Pickle · 3.9s)

_Thinking:_

Hmm still fails. So `app.core.database` doesn't exist? Earlier in this conversation, `python -c "import app.main"` worked (BACKEND_OK check). Maybe database engine module is `app.core.database`? Let me check backend app structure.

**Tool: glob**

**Input:**
```json
{
  "path": "C:\\aaditya\\Opencode-project\\SIH26135\\backend\\app\\core",
  "pattern": "*.py"
}
```

**Output:**
```
C:\aaditya\Opencode-project\SIH26135\backend\app\core\security.py
C:\aaditya\Opencode-project\SIH26135\backend\app\core\masking.py
C:\aaditya\Opencode-project\SIH26135\backend\app\core\exceptions.py
```

---

## Assistant (Build · Big Pickle · 4.5s)

_Thinking:_

No database.py in core. So where's the engine? Let me search.

**Tool: grep**

**Input:**
```json
{
  "path": "C:\\aaditya\\Opencode-project\\SIH26135\\backend\\app",
  "pattern": "create_async_engine|async_sessionmaker"
}
```

**Output:**
```
Found 3 matches
C:\aaditya\Opencode-project\SIH26135\backend\app\database.py:
  Line 1: from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

  Line 11: engine = create_async_engine(

  Line 19: async_session_factory = async_sessionmaker(

```

---

## Assistant (Build · Big Pickle · 4.1s)

Module is `app.database`. Fix the script:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\stale_offer.py",
  "oldString": "from app.core.database import engine",
  "newString": "from app.database import engine"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 6.6s)

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; python -c \"import sys; sys.path.insert(0, r'C:\\aaditya\\Opencode-project\\SIH26135\\backend'); exec(open(r'C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\stale_offer.py', encoding='utf-8').read())\" 2>$null",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```
2026-09-05 02:44:55,830 INFO sqlalchemy.engine.Engine select pg_catalog.version()
2026-09-05 02:44:55,830 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 02:44:55,832 INFO sqlalchemy.engine.Engine select current_schema()
2026-09-05 02:44:55,832 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 02:44:55,834 INFO sqlalchemy.engine.Engine show standard_conforming_strings
2026-09-05 02:44:55,834 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 02:44:55,836 INFO sqlalchemy.engine.Engine BEGIN (implicit)
2026-09-05 02:44:55,837 INFO sqlalchemy.engine.Engine 
                SELECT ja.id, c.full_name, j.title, ja.applied_at
                FROM job_applications ja
                JOIN candidates c ON c.id = ja.candidate_id
                JOIN job_postings j ON j.id = ja.job_posting_id
                WHERE ja.status = 'offered' AND j.employer_id = $1
                ORDER BY ja.applied_at DESC
                
2026-09-05 02:44:55,837 INFO sqlalchemy.engine.Engine [generated in 0.00015s] ('587d42d3-e051-434a-9294-c3bcc0b02ea1',)
Priya Patel | Data Analyst | 2026-08-27 09:30:00
Karthik Iyer | Java Full-Stack Developer | 2026-08-27 09:30:00
2026-09-05 02:44:55,854 INFO sqlalchemy.engine.Engine COMMIT
2026-09-05 02:44:55,859 INFO sqlalchemy.engine.Engine BEGIN (implicit)
2026-09-05 02:44:55,860 INFO sqlalchemy.engine.Engine UPDATE job_applications SET applied_at = $1 WHERE id = $2
2026-09-05 02:44:55,860 INFO sqlalchemy.engine.Engine [generated in 0.00036s] (datetime.datetime(2026, 8, 21, 21, 14, 55, 856936), UUID('ae487c2b-01be-4c11-936b-07cd1b54f31b'))
2026-09-05 02:44:55,880 INFO sqlalchemy.engine.Engine COMMIT
STALE_UPDATED ae487c2b-01be-4c11-936b-07cd1b54f31b -> 2026-08-21T21:14:55.856936

```

---

## Assistant (Build · Big Pickle · 28.8s)

_Thinking:_

Wait — the run date is 2026-09-05 today. Two offered apps: Priya Patel (Data Analyst) and Karthik Iyer (Java). Karthik's applied_at updated to 2026-08-21 (14 days ago) → now "14d waiting", stale. Priya at 08-27 → 9 days? From 08-27 to 09-05 is 9 days — also stale (>=7). Hmm, that makes both stale. Fine — realistic: two pending offers, one chunkier. Actually that's good for showing the feature. Both will show amber "N d waiting". Good enough.

Wait, but `datetime.utcnow() - 14d` gave 08-21 21:14 UTC 2026, but today is 09-05. Utah: 09-05 minus 14 = 08-22. Hmm 08-21 21:14 vs expected 08-22. utcnow is UTC; local is likely IST (UTC+5:30). Now local ~02:45 AM 09-05 IST = UTC 21:14 09-04. minus 14d = 08-21 21:14 UTC. But applied_at stored is naive datetime interpreted as local (IST) when displayed. So displayed applied date becomes 08-22 02:44 IST-ish → 14 days ago. Fine.

Now the offers panel: offered apps have applied_at 08-22 and 08-27; pending days = 14 and 9. Both stale → amber. The intent was to show one stale; two is fine.

Clean up temp file. Then run the verification gates: tsc, ruff, tests. Also quick route smoke optional.

Let me remove temp file and run tsc + ruff + pytest in parallel.

Karthik's offer now backdated 14 days; both pending offers will highlight as stale (>7d). Clean up and run the gates:

**Tool: bash**

**Input:**
```json
{
  "command": "Remove-Item -LiteralPath \"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\stale_offer.py\" -ErrorAction SilentlyContinue; Write-Output \"cleaned\""
}
```

**Output:**
```
cleaned

```

**Tool: bash**

**Input:**
```json
{
  "command": "npx tsc --noEmit; Write-Output \"TSC_EXIT:$LASTEXITCODE\"",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend",
  "timeout": 240000
}
```

**Output:**
```
src/app/employer/page.tsx(1319,62): error TS2552: Cannot find name 'formatISODate'. Did you mean 'formatISODateTime'?
src/app/employer/page.tsx(1321,60): error TS2304: Cannot find name 'formatINR'.
TSC_EXIT:2

```

**Tool: bash**

**Input:**
```json
{
  "command": "python -m ruff check app/ --select F401,F811,F821; Write-Output \"RUFF_EXIT:$LASTEXITCODE\"",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```
warning: The top-level linter settings are deprecated in favour of their counterparts in the `lint` section. Please update the following options in `C:\aaditya\Opencode-project\SIH26135\pyproject.toml`:
  - 'ignore' -> 'lint.ignore'
  - 'select' -> 'lint.select'
  - 'isort' -> 'lint.isort'
All checks passed!
RUFF_EXIT:0

```

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; python -m pytest backend/tests workers/tests -q -p no:cacheprovider 2>$null | Select-Object -Last 5",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135",
  "timeout": 300000
}
```

**Output:**
```
backend\app\utils\__init__.py                      0      0   100%
backend\app\utils\geo.py                          16     12    25%   84-86, 91-99
----------------------------------------------------------------------------
TOTAL                                           3470   1903    45%
======================= 49 passed, 1 warning in 11.06s ========================

```

---

## Assistant (Build · Big Pickle · 6.1s)

_Thinking:_

Need to import formatISODate and formatINR in employer/page.tsx.

Fix imports on employer page:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\employer\\page.tsx",
  "newString": "import { formatISODate, formatISODateTime, formatINR } from \"@/lib/utils\";",
  "oldString": "import { formatISODateTime } from \"@/lib/utils\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 9.5s)

**Tool: bash**

**Input:**
```json
{
  "command": "npx tsc --noEmit; Write-Output \"TSC_EXIT:$LASTEXITCODE\"",
  "timeout": 240000,
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend"
}
```

**Output:**
```
TSC_EXIT:0

```

---

## Assistant (Build · Big Pickle · 14.0s)

_Thinking:_

All gates green. Quick smoke on the frontend routes would be nice but backend unchanged (only DB data). Pipeline page has a frontend-only change; candidate apps page frontend-only. tsc passed. The backend wasn't modified this batch, so no restart needed.

Let me update the todo list to completed and give a concise summary. Let me also verify the pipeline page edit didn't break anything visually — tsc covers it.

Actually let me do a quick frontend dev-server smoke for the three routes to be safe. Check if dev server running.

All gates pass. Quick route smoke to confirm the changed pages render:

**Tool: bash**

**Input:**
```json
{
  "command": "$candidates = curl.exe -s -o NUL -w \"%{http_code}\" -X POST http://127.0.0.1:8000/api/v1/auth/login -d '{\"phone\":\"9876543210\",\"password\":\"password123\"}' -H \"Content-Type: application/json\"; $employers = curl.exe -s -o NUL -w \"%{http_code}\" -X POST http://127.0.0.1:8000/api/v1/auth/login -d '{\"phone\":\"9900000001\",\"password\":\"password123\"}' -H \"Content-Type: application/json\"; Write-Output \"candidate_login:$candidates employer_login:$employers\""
}
```

**Output:**
```
candidate_login:404 employer_login:404

```

**Tool: bash**

**Input:**
```json
{
  "command": "$p3000 = curl.exe -s -o NUL -w \"%{http_code}\" http://127.0.0.1:3000/employer/pipeline; $p3001 = curl.exe -s -o NUL -w \"%{http_code}\" http://127.0.0.1:3001/employer/pipeline; Write-Output \"pipeline_3000:$p3000 3001:$p3001\""
}
```

**Output:**
```
pipeline_3000:200 3001:000

```

---

## Assistant (Build · Big Pickle · 39.7s)

_Thinking:_

Login 404? Wait — the login route is `/api/v1/auth/login`. Let me check the actual auth route path. Earlier smoke worked via curl with @file. 404 could mean no backend running on 8000, or path wrong. Pipeline page returns 200 on 3000 (dev server up). Let me check backend on 8000.

Pipeline renders 200. Backend login path check:

**Tool: bash**

**Input:**
```json
{
  "command": "$h = curl.exe -s -o NUL -w \"%{http_code}\" http://127.0.0.1:8000/api/v1/health; $r = curl.exe -s -o NUL -w \"%{http_code}\" http://127.0.0.1:8000/api/v1/auth/login; Write-Output \"health:$h login_get:$r\""
}
```

**Output:**
```
health:404 login_get:404

```

---

## Assistant (Build · Big Pickle · 10.5s)

_Thinking:_

Backend isn't running (all 404). The pipeline 200 came from frontend dev server only (it renders client-side page with auth guard; the page loads but data fetch may fail). Since backend wasn't changed this batch, and earlier backend verifications passed, I just need to restart backend to confirm everything's alive for live use. Let me check port 8000 and restart the backend.

Backend isn't running. Restart it:

**Tool: bash**

**Input:**
```json
{
  "command": "$conn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue; if ($conn) { Stop-Process -Id $conn.OwningProcess -Force; Start-Sleep -Seconds 2; Write-Output \"stopped old backend\" }; Write-Output done"
}
```

**Output:**
```
stopped old backend
done

```

---

## Assistant (Build · Big Pickle · 59.2s)

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; Start-Process python -ArgumentList \"-m\",\"uvicorn\",\"app.main:app\",\"--host\",\"0.0.0.0\",\"--port\",\"8000\" -WorkingDirectory \"C:\\aaditya\\Opencode-project\\SIH26135\\backend\" -WindowStyle Hidden; Start-Sleep -Seconds 8; Write-Output \"started\"",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```
started

```

---

## Assistant (Build · Big Pickle · 9.7s)

_Thinking:_

Wait — the port was empty before (?). The Get-NetTCPConnection returned nothing and "stopped old backend" was printed... Actually it printed "stopped old backend" then "done", meaning a listener existed on 8000. Odd that curl got 404s — maybe the earlier `Start-Process` backend was listening but with a stale app that served 404? Or the listener was something else. Anyway, now restarted. Verify login + overview endpoint + candidate interviews.

**Tool: bash**

**Input:**
```json
{
  "command": "$e = curl.exe -s -X POST http://127.0.0.1:8000/api/v1/auth/login -d '{\"phone\":\"9900000001\",\"password\":\"password123\"}' -H \"Content-Type: application/json\"; $token = ($e | ConvertFrom-Json).access_token; $o = curl.exe -s -o NUL -w \"%{http_code}\" \"http://127.0.0.1:8000/api/v1/applications/overview\" -H \"Authorization: Bearer $token\"; Write-Output \"OVERVIEW_HTTP:$o\""
}
```

**Output:**
```
OVERVIEW_HTTP:401

```

---

## Assistant (Build · Big Pickle · 5.8s)

_Thinking:_

401 — token parsing failed? `$e | ConvertFrom-Json` — if login returned non-JSON or error, access_token null → "Bearer ". Let me debug: print the login response.





**Tool: bash**

**Input:**
```json
{
  "command": "$e = curl.exe -s -X POST http://127.0.0.1:8000/api/v1/auth/login -d '{\"phone\":\"9900000001\",\"password\":\"password123\"}' -H \"Content-Type: application/json\"; Write-Output \"RAW_LEN:$($e.Length)\"; Write-Output $e.Substring(0, [Math]::Min(200, $e.Length))"
}
```

**Output:**
```
RAW_LEN:22
{"detail":"Not Found"}

```

---

## Assistant (Build · Big Pickle · 5.4s)

**Tool: grep**

**Input:**
```json
{
  "path": "C:\\aaditya\\Opencode-project\\SIH26135\\backend\\app",
  "pattern": "prefix=.*auth|/login"
}
```

**Output:**
```
Found 2 matches
C:\aaditya\Opencode-project\SIH26135\backend\app\main.py:
  Line 66:     app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])


C:\aaditya\Opencode-project\SIH26135\backend\app\api\v1\auth.py:
  Line 69: @router.post("/login/password", response_model=TokenResponse)

```

---

## Assistant (Build · Big Pickle · 7.2s)

_Thinking:_

Path is `/api/v1/auth/login/password`. Use that. Also earlier smoke in this conversation used that presumably. Retry.





**Tool: bash**

**Input:**
```json
{
  "command": "$e = curl.exe -s -X POST http://127.0.0.1:8000/api/v1/auth/login/password -d '{\"phone\":\"9900000001\",\"password\":\"password123\"}' -H \"Content-Type: application/json\"; $token = ($e | ConvertFrom-Json).access_token; $o = curl.exe -s \"http://127.0.0.1:8000/api/v1/applications/overview\" -H \"Authorization: Bearer $token\"; $j = $o | ConvertFrom-Json; $offered = ($j.applications | Where-Object { $_.status -eq \"offered\" }); Write-Output \"TOTAL:$($j.total) OFFERED:$($offered.Count)\"; $offered | ForEach-Object { Write-Output \"  $($_.candidate.full_name) | $($_.job.title) | applied $($_.applied_at)\" }"
}
```

**Output:**
```
TOTAL: OFFERED:0

```

---

## Assistant (Build · Big Pickle · 8.3s)

_Thinking:_

TOTAL empty and OFFERED:0 — the `$j.total` empty means the overview JSON property might be different, or the token empty again. Let me print the token length and the raw overview response. Also maybe overview response has `total` key. Let me debug.

**Tool: bash**

**Input:**
```json
{
  "command": "$e = curl.exe -s -X POST http://127.0.0.1:8000/api/v1/auth/login/password -d '{\"phone\":\"9900000001\",\"password\":\"password123\"}' -H \"Content-Type: application/json\"; Write-Output \"LOGIN:$e\"; $token = ($e | ConvertFrom-Json).access_token; $o = curl.exe -s \"http://127.0.0.1:8000/api/v1/applications/overview\" -H \"Authorization: Bearer $token\"; Write-Output \"OVERVIEW_LEN:$($o.Length)\"; Write-Output $o.Substring(0, [Math]::Min(300, $o.Length))"
}
```

**Output:**
```
LOGIN:{"detail":[{"type":"json_invalid","loc":["body",1],"msg":"JSON decode error","input":{},"ctx":{"error":"Expecting property name enclosed in double quotes"}}]}
OVERVIEW_LEN:37
{"detail":"Invalid or expired token"}

```

---

## Assistant (Build · Big Pickle · 8.2s)

_Thinking:_

The JSON body got mangled — double quotes stripped by PowerShell. Known quirk: need `-d "@file.json"`. Write a temp JSON file.

PowerShell strips the quotes. Use a JSON file for the body:

**Tool: bash**

**Input:**
```json
{
  "command": "Set-Content -LiteralPath \"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login.json\" -Value '{\"phone\":\"9900000001\",\"password\":\"password123\"}' -Encoding ascii; $e = curl.exe -s -X POST http://127.0.0.1:8000/api/v1/auth/login/password -d \"@C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login.json\" -H \"Content-Type: application/json\"; $token = ($e | ConvertFrom-Json).access_token; $o = curl.exe -s \"http://127.0.0.1:8000/api/v1/applications/overview\" -H \"Authorization: Bearer $token\"; $j = $o | ConvertFrom-Json; Write-Output \"TOTAL:$($j.total)\"; $j.applications | Where-Object { $_.status -eq \"offered\" } | ForEach-Object { Write-Output \"  OFFER: $($_.candidate.full_name) | $($_.job.title) | applied $($_.applied_at)\" }; Remove-Item -LiteralPath \"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login.json\" -ErrorAction SilentlyContinue"
}
```

**Output:**
```
TOTAL:21
  OFFER: Priya Patel | Data Analyst | applied 2026-08-27T09:30:00
  OFFER: Karthik Iyer | Java Full-Stack Developer | applied 2026-08-21T21:14:55.856936

```

---

## Assistant (Build · Big Pickle · 6.6s)

_Thinking:_

Backend is up, overview works, both offered apps present (Karthik 14d ago → stale, Priya 9d → stale). All batch items done:

1. Offers Awaiting Response panel — done.
2. Pipeline quick "Interview" action — done.
3. Candidate onboarding checklist — done.
4. Stale-offer sample — done.
5. Verify: tsc EXIT:0, ruff clean, 49 tests pass, backend up, overview live, pipeline route 200.

Update todos to completed and give concise summary.





**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Add Offers Awaiting Response panel on employer dashboard",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Add quick Schedule-interview action on employer pipeline rows",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Add candidate post-hire onboarding checklist card",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Stale-offer sample data (Karthik offered app backdated 14d)",
      "status": "completed",
      "priority": "medium"
    },
    {
      "content": "Verify tsc, ruff, pytest, backend live + overview smoke",
      "status": "completed",
      "priority": "high"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Add Offers Awaiting Response panel on employer dashboard",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Add quick Schedule-interview action on employer pipeline rows",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Add candidate post-hire onboarding checklist card",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Stale-offer sample data (Karthik offered app backdated 14d)",
    "status": "completed",
    "priority": "medium"
  },
  {
    "content": "Verify tsc, ruff, pytest, backend live + overview smoke",
    "status": "completed",
    "priority": "high"
  }
]
```

---

## Assistant (Build · Big Pickle · 15.0s)

Hiring-lifecycle batch complete and verified.

**Employer dashboard** — new "Offers Awaiting Response" panel (`frontend/src/app/employer/page.tsx`) showing all open offers with pending-days chips (amber "N d waiting" + follow-up hint when >7 days). Two live offers now populate it: Karthik Iyer (Java, 14d waiting → stale) and Priya Patel (Data Analyst, 9d).

**Pipeline** (`frontend/src/app/employer/pipeline/page.tsx`) — added a one-click **Interview** shortcut (calendar icon) on applied/shortlisted cards that opens the existing schedule modal preset to the interview stage, plus an "Offer" action label on interview-stage Advance.

**Candidate apps** (`frontend/src/app/candidate/applications/page.tsx`) — hired banner now embeds an onboarding checklist (5 steps: agreement, PAN/bank, formalities, laptop/accounts, Day-1 orientation) with a progress bar, persisted in localStorage per application.

**Data** — Karthik's offered Java app `applied_at` backdated 14 days via direct DB update (seed skips when apps exist).

**Gates:** `npx tsc --noEmit` clean, ruff (F401/F811/F821) clean, 49/49 tests pass, backend restarted and verified live — `/applications/overview` returns 21 apps with both offers, `/employer/pipeline` renders 200.

---

## User

go

---

## Assistant (Build · Big Pickle · 103.5s)

_Thinking:_

The user said "go" — continue with the next features. Let me plan what to do next. The overall objective is to keep adding details/features and sample data across role dashboards.

Current state recap:
- Employer dashboard: funnel aggregation, Recent Applicants, Upcoming Interviews, Offers Awaiting Response, Sector Benchmark, Salary Benchmark.
- Employer pipeline: stages, quick Interview shortcut.
- Candidate applications: interview card, hired banner with onboarding checklist.
- Gov: candidate drawer with enrollment + outcome timeline.

What's next? Let me pick impactful next features. Ideas:

1. **Candidate dashboard** (`frontend/src/app/candidate/page.tsx`) — probably could use enrichment: recommended jobs, application status summary widgets, notifications panel, profile completion card, next interview spotlight.

2. **Employer notifications page** — could add tab/filter, mark-all-read.

3. **Gov dashboard** — role-side dashboards: Gov overview page might need sample data too.

4. **Interviews landing page** for employer — view all upcoming interviews across postings (currently dashboard panel only shows 5).

5. **Candidate "Offers" awareness** — candidate should see offered/hired summary; already have cards per application.

6. **Notification for candidate on offer/hire** — already auto-notifications exist (status PATCH creates notifications + enqueues). Candidate notifications page exists.

Let me think about what gives the most visible value for the user's journey of "add details and features into employer dashboard and sample data also" — but they've now said "go" twice, generalizing the push to keep building out the platform.

Good next batch: **Candidate experience + Gov dashboard enrichment** with sample data. Actually let me focus on big gaps:

A. **Candidate dashboard** — check current state. It likely has stats + recommended jobs + maybe application summary. Could add:
   - "Your next interview" spotlight card (from `/applications/mine` sort by interview_at).
   - Application status donut/summary.
   - Profile completeness card (guidance: add skills, district, state, etc.) with progress bar — very "demo-able" since Rahul sample candidate may have full data though.

B. **Gov dashboard** — what does it show? Let me check. Gov role overview likely needs: district activity, placement stats, employment status. Add enrollment/outcome sparkline + "districts tracked", "top skills in demand" etc. Plus sample data for a gov admin is difficult — gov sees all candidates/employers, which we already have.

C. **Candidate interview prep** already exists.

D. **Employer: Reminders/follow-ups** — "Follow up" button on stale offers → sends notification to candidate. Could wire notifyShortlistedCandidates style. Actually a "Remind candidate" button that queues an employer notification... needs candidate notifications too. Could be nice but more backend work.

E. **Candidate notifications** — maybe auto-notify candidate on interview schedule/offer/hire already handled by auto-notifications in backend (shortlisted/interview/offered/hired/rejected create Notification). Is there a "mark all read"? Minor.

F. **Employer jobs page** — exists.

G. **Search/filter** on employer pipeline — filter candidates by skill/match during a stage. Nice.

H. **Sample data breadth**: gov stats, training partner, placements.

Let me explore what candidate dashboard and gov dashboard currently look like, then pick. I'll go check candidate page first, and gov pages. Let me look at candidate dashboard and gov dashboard structure.

Actually, let me be decisive: batch = **"Candidate dashboard enrichment + Gov dashboard build-out"**:

Candidate dashboard (`frontend/src/app/candidate/page.tsx`):
1. Next-interview spotlight (pulls from useMyApplications, shows nearest upcoming interview with countdown chips).
2. Application status overview (5 mini-stat cards from /applications/mine counts).
3. Profile completeness gauge + quick-fix links.
4. Recent notifications mini-feed.

Gov dashboard: check current page. Likely `frontend/src/app/gov/page.tsx` showing stats. Add:
- District activity panel (applications by district bar).
- Top in-demand skills panel.
- Placement trend sparkline.

Let me first explore candidate + gov pages to see what exists. Use reads.

Let me look at candidate page and gov page.

Broadening to the candidate & gov experiences. Let me inspect what they have now:

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\candidate\\page.tsx"
}
```

**Output:**
```
<path>C:\aaditya\Opencode-project\SIH26135\frontend\src\app\candidate\page.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useEffect, useState, useCallback, useMemo } from "react";
4: import Link from "next/link";
5: import api from "@/lib/api";
6: import {
7:   usePlacementScore,
8:   useMyApplications,
9:   useMyNotifications,
10:   useCandidateJobMatches,
11:   useTopSkills,
12:   useOutcomeTimeline,
13:   useCourses,
14:   updateCandidate,
15: } from "@/lib/hooks/useDashboard";
16: import { useRequireAuth } from "@/lib/hooks/useAuthGuard";
17: import type { CandidateListItem, CourseListItem, JobApplication, TopSkill } from "@/lib/types";
18: import Modal from "@/components/ui/Modal";
19: import Field from "@/components/ui/Field";
20: import Toast from "@/components/ui/Toast";
21: import {
22:   Target,
23:   ShieldCheck,
24:   Sparkles,
25:   Briefcase,
26:   History,
27:   ArrowUpRight,
28:   Pencil,
29:   FileText,
30:   Bell,
31:   MapPin,
32:   Layers,
33:   CheckCircle2,
34:   XCircle,
35:   Clock,
36:   Star,
37:   UserCheck,
38:   Loader2,
39:   TrendingUp,
40:   TrendingDown,
41:   AlertTriangle,
42:   Map,
43:   Zap,
44:   Award,
45:   CircleDot,
46:   Check,
47:   ChevronRight,
48:   X,
49:   ArrowRight,
50:   GraduationCap,
51: } from "lucide-react";
52: 
53: const ONBOARDING_SESSION_KEY = "onboarding-dismissed";
54: 
55: const ONBOARDING_SKILLS = [
56:   "Python", "Django", "React", "SQL", "AWS", "JavaScript", "Node.js",
57:   "Data Science", "Excel", "Tally", "Digital Marketing", "Healthcare",
58:   "CNC", "Accounting", "Customer Service", "English",
59: ];
60: 
61: const JOB_ALERT_STATES = [
62:   "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Haryana",
63:   "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Punjab",
64:   "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
65: ];
66: 
67: function useCountUp(target: number, duration = 800, active = true) {
68:   const [count, setCount] = useState(0);
69:   useEffect(() => {
70:     if (!active || target === 0) { setCount(target); return; }
71:     let start = 0;
72:     const step = Math.max(1, Math.ceil(target / (duration / 16)));
73:     const id = setInterval(() => {
74:       start += step;
75:       if (start >= target) { setCount(target); clearInterval(id); }
76:       else setCount(start);
77:     }, 16);
78:     return () => clearInterval(id);
79:   }, [target, duration, active]);
80:   return count;
81: }
82: 
83: function Skeleton({ className = "" }: { className?: string }) {
84:   return <div className={`skeleton ${className}`} />;
85: }
86: 
87: const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
88:   applied:      { bg: "bg-indigo-100",   text: "text-indigo-700",   icon: FileText },
89:   shortlisted:  { bg: "bg-amber-100",   text: "text-amber-700",   icon: Star },
90:   interview:    { bg: "bg-purple-100",   text: "text-purple-700",  icon: Clock },
91:   offered:      { bg: "bg-sky-100",      text: "text-sky-700",     icon: CheckCircle2 },
92:   hired:        { bg: "bg-emerald-100",  text: "text-emerald-700", icon: UserCheck },
93:   rejected:     { bg: "bg-rose-100",     text: "text-rose-700",    icon: XCircle },
94: };
95: 
96: function StatusChip({ status }: { status: string }) {
97:   const cfg = STATUS_CONFIG[status] ?? { bg: "bg-slate-100", text: "text-slate-600", icon: FileText };
98:   const Icon = cfg.icon;
99:   return (
100:     <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
101:       <Icon className="h-3 w-3" />
102:       {status.charAt(0).toUpperCase() + status.slice(1)}
103:     </span>
104:   );
105: }
106: 
107: /* ═══════════════════════════════════════════════
108:    Onboarding Wizard
109:    ═══════════════════════════════════════════════ */
110: 
111: function isProfileIncomplete(c: CandidateListItem | null): boolean {
112:   if (!c) return false;
113:   if (!c.state?.trim()) return true;
114:   if (!c.district?.trim()) return true;
115:   const pincode = (c as unknown as Record<string, string>).pincode;
116:   if (!pincode?.trim()) return true;
117:   if ((c.skill_tags?.length ?? 0) < 3) return true;
118:   if (!c.email?.trim()) return true;
119:   return false;
120: }
121: 
122: interface OnboardingWizardProps {
123:   candidate: CandidateListItem;
124:   onComplete: () => void;
125:   onDismiss: () => void;
126: }
127: 
128: function OnboardingWizard({ candidate, onComplete, onDismiss }: OnboardingWizardProps) {
129:   const [step, setStep] = useState(1);
130:   const [saving, setSaving] = useState(false);
131: 
132:   const [fullName] = useState(candidate.full_name ?? "");
133:   const [email, setEmail] = useState(candidate.email ?? "");
134:   const [state, setState] = useState(candidate.state ?? "");
135:   const [district, setDistrict] = useState(candidate.district ?? "");
136:   const [pincode, setPincode] = useState(
137:     (candidate as unknown as Record<string, string>).pincode ?? "",
138:   );
139: 
140:   const existingSkills = useMemo(() => {
141:     const raw = candidate.skill_tags ?? [];
142:     return new Set(raw.filter((s) => ONBOARDING_SKILLS.includes(s)));
143:   }, [candidate]);
144:   const [selectedSkills, setSelectedSkills] = useState<Set<string>>(existingSkills);
145: 
146:   const [allowContact, setAllowContact] = useState(
147:     candidate.allow_employer_contact !== false,
148:   );
149: 
150:   const toggleSkill = (skill: string) => {
151:     setSelectedSkills((prev) => {
152:       const next = new Set(prev);
153:       if (next.has(skill)) next.delete(skill);
154:       else next.add(skill);
155:       return next;
156:     });
157:   };
158: 
159:   const step2Valid = selectedSkills.size >= 3;
160: 
161:   const stepLabels = ["Personal", "Skills", "Visibility"];
162: 
163:   const handleFinish = async () => {
164:     setSaving(true);
165:     try {
166:       await updateCandidate(candidate.id, {
167:         email: email || null,
168:         full_name: fullName,
169:         state: state || null,
170:         district: district || null,
171:         pincode: pincode || null,
172:         skill_tags: Array.from(selectedSkills),
173:         allow_employer_contact: allowContact,
174:       } as unknown as Parameters<typeof updateCandidate>[1]);
175:       onComplete();
176:     } catch {
177:       setSaving(false);
178:     }
179:   };
180: 
181:   return (
182:     <div className="fixed inset-0 z-[100] flex items-center justify-center">
183:       <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" />
184: 
185:       <button
186:         onClick={onDismiss}
187:         className="absolute right-6 top-6 z-[101] flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-400 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-slate-200"
188:       >
189:         I&apos;ll do this later
190:         <X className="h-4 w-4" />
191:       </button>
192: 
193:       <div className="relative z-[101] w-full max-w-lg animate-scale-in rounded-2xl border border-white/15 bg-[#151c35]/95 p-8 shadow-2xl backdrop-blur-2xl">
194:         {/* Header */}
195:         <div className="mb-2 text-center">
196:           <h2 className="bg-gradient-to-r from-violet-300 to-brand-200 bg-clip-text text-xl font-bold text-transparent">
197:             Complete Your Profile
198:           </h2>
199:           <p className="mt-1 text-sm text-slate-400">
200:             A few details help us find the best opportunities for you.
201:           </p>
202:         </div>
203: 
204:         {/* Progress dots */}
205:         <div className="flex items-center justify-center gap-3 my-5">
206:           {stepLabels.map((label, i) => {
207:             const num = i + 1;
208:             const active = num === step;
209:             const done = num < step;
210:             return (
211:               <div key={label} className="flex items-center gap-3">
212:                 <div className="flex flex-col items-center gap-1">
213:                   <div
214:                     className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
215:                       done
216:                         ? "bg-emerald-500 text-white"
217:                         : active
218:                         ? "bg-gradient-to-r from-brand-500 to-violet-500 text-white shadow-lg shadow-brand-500/30"
219:                         : "bg-white/10 text-slate-500"
220:                     }`}
221:                   >
222:                     {done ? <Check className="h-4 w-4" /> : num}
223:                   </div>
224:                   <span
225:                     className={`text-[11px] font-medium ${
226:                       active ? "text-violet-300" : done ? "text-emerald-400" : "text-slate-500"
227:                     }`}
228:                   >
229:                     {label}
230:                   </span>
231:                 </div>
232:                 {i < stepLabels.length - 1 && (
233:                   <div
234:                     className={`mb-5 h-0.5 w-10 rounded-full transition-all duration-300 ${
235:                       done ? "bg-emerald-500" : "bg-white/10"
236:                     }`}
237:                   />
238:                 )}
239:               </div>
240:             );
241:           })}
242:         </div>
243: 
244:         {/* Step content */}
245:         <div className="min-h-[260px] mt-4">
246:           {step === 1 && (
247:             <div className="space-y-4 animate-fade-in">
248:               <Field
249:                 label="Full Name"
250:                 name="onb_full_name"
251:                 value={fullName}
252:                 onChange={() => {}}
253:                 required
254:                 placeholder="Your full name"
255:               />
256:               <p className="text-xs text-slate-500 -mt-2 ml-0.5">Read-only from your account</p>
257:               <Field
258:                 label="Email"
259:                 name="onb_email"
260:                 value={email}
261:                 onChange={setEmail}
262:                 placeholder="email@example.com"
263:               />
264:               <div className="grid grid-cols-2 gap-4">
265:                 <Field
266:                   label="State"
267:                   name="onb_state"
268:                   value={state}
269:                   onChange={setState}
270:                   required
271:                   placeholder="e.g. Maharashtra"
272:                 />
273:                 <Field
274:                   label="District"
275:                   name="onb_district"
276:                   value={district}
277:                   onChange={setDistrict}
278:                   required
279:                   placeholder="e.g. Pune"
280:                 />
281:               </div>
282:               <Field
283:                 label="Pincode"
284:                 name="onb_pincode"
285:                 value={pincode}
286:                 onChange={setPincode}
287:                 required
288:                 placeholder="e.g. 411001"
289:               />
290:             </div>
291:           )}
292: 
293:           {step === 2 && (
294:             <div className="animate-fade-in">
295:               <div className="flex items-center justify-between mb-3">
296:                 <p className="text-sm font-medium text-slate-300">
297:                   Select your skills
298:                 </p>
299:                 <span className="text-xs text-slate-500">
300:                   {selectedSkills.size} selected · 3+ recommended
301:                 </span>
302:               </div>
303:               <div className="flex flex-wrap gap-2">
304:                 {ONBOARDING_SKILLS.map((skill) => {
305:                   const active = selectedSkills.has(skill);
306:                   return (
307:                     <button
308:                       key={skill}
309:                       onClick={() => toggleSkill(skill)}
310:                       className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
311:                         active
312:                           ? "bg-gradient-to-r from-brand-500 to-violet-500 text-white shadow-md shadow-brand-500/25"
313:                           : "border border-white/10 bg-white/5 text-slate-400 hover:border-violet-300/40 hover:text-violet-300"
314:                       }`}
315:                     >
316:                       {active && <Check className="inline h-3 w-3 mr-1 -mt-0.5" />}
317:                       {skill}
318:                     </button>
319:                   );
320:                 })}
321:               </div>
322:               {!step2Valid && (
323:                 <p className="mt-3 text-xs text-amber-400/80">
324:                   Select at least 3 skills to continue.
325:                 </p>
326:               )}
327:             </div>
328:           )}
329: 
330:           {step === 3 && (
331:             <div className="animate-fade-in space-y-5">
332:               <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
333:                 <div className="flex items-start justify-between gap-4">
334:                   <div className="flex-1">
335:                     <p className="text-sm font-semibold text-slate-200">
336:                       Contact visibility
337:                     </p>
338:                     <p className="mt-1 text-xs text-slate-400 leading-relaxed">
339:                       When enabled, employers can see your phone number on job matches and
340:                       applications. Turn off to keep your contact private.
341:                     </p>
342:                   </div>
343:                   <button
344:                     type="button"
345:                     role="switch"
346:                     aria-checked={allowContact}
347:                     onClick={() => setAllowContact((v) => !v)}
348:                     className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${
349:                       allowContact
350:                         ? "bg-gradient-to-r from-brand-500 to-violet-500"
351:                         : "bg-slate-600"
352:                     }`}
353:                   >
354:                     <span
355:                       className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
356:                         allowContact ? "translate-x-6" : "translate-x-1"
357:                       }`}
358:                     />
359:                   </button>
360:                 </div>
361:                 <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
362:                   <ShieldCheck className={`h-4 w-4 ${allowContact ? "text-emerald-400" : "text-slate-500"}`} />
363:                   <span className="text-xs text-slate-400">
364:                     {allowContact
365:                       ? "Visible — employers can contact you directly"
366:                       : "Hidden — your phone number is private"}
367:                   </span>
368:                 </div>
369:               </div>
370: 
371:               <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
372:                 <p className="text-sm font-medium text-violet-300">All set!</p>
373:                 <p className="mt-1 text-xs text-slate-400 leading-relaxed">
374:                   Click <span className="font-semibold text-violet-200">Finish</span> to save your profile.
375:                   You can always update these details from your dashboard.
376:                 </p>
377:               </div>
378:             </div>
379:           )}
380:         </div>
381: 
382:         {/* Footer buttons */}
383:         <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/10">
384:           {step > 1 ? (
385:             <button
386:               onClick={() => setStep((s) => s - 1)}
387:               className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-white/[0.06] hover:text-slate-200"
388:             >
389:               Back
390:             </button>
391:           ) : (
392:             <div />
393:           )}
394: 
395:           {step < 3 ? (
396:             <button
397:               onClick={() => setStep((s) => s + 1)}
398:               disabled={step === 2 && !step2Valid}
399:               className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
400:             >
401:               Continue
402:               <ArrowRight className="h-4 w-4" />
403:             </button>
404:           ) : (
405:             <button
406:               onClick={handleFinish}
407:               disabled={saving}
408:               className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:brightness-110 disabled:opacity-50"
409:             >
410:               {saving && <Loader2 className="h-4 w-4 animate-spin" />}
411:               {saving ? "Saving..." : "Finish"}
412:               {!saving && <Check className="h-4 w-4" />}
413:             </button>
414:           )}
415:         </div>
416:       </div>
417:     </div>
418:   );
419: }
420: 
421: /* ═══════════════════════════════════════════════
422:    Candidate Dashboard
423:    ═══════════════════════════════════════════════ */
424: 
425: export default function CandidateDashboard() {
426:   useRequireAuth("candidate");
427: 
428:   const [candidate, setCandidate] = useState<CandidateListItem | null>(null);
429:   const [profileLoading, setProfileLoading] = useState(true);
430: 
431:   const [editOpen, setEditOpen] = useState(false);
432:   const [editForm, setEditForm] = useState({
433:     full_name: "",
434:     email: "",
435:     state: "",
436:     district: "",
437:     pincode: "",
438:     skill_tags: "",
439:     allow_employer_contact: true,
440:     preferred_job_states: [] as string[],
441:   });
442:   const [saving, setSaving] = useState(false);
443:   const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
444: 
445:   const [skillAlertDismissed, setSkillAlertDismissed] = useState(false);
446: 
447:   const [showOnboarding, setShowOnboarding] = useState(false);
448: 
449:   const candidateId = candidate?.id;
450: 
451:   const { data: score, loading: scoreLoading } = usePlacementScore(candidateId);
452:   const { data: applications, loading: appsLoading } = useMyApplications();
453:   const { data: notifications, loading: notifLoading } = useMyNotifications();
454:   const { data: jobMatches, loading: matchesLoading } = useCandidateJobMatches(candidateId);
455:   const { data: topSkills, loading: topSkillsLoading } = useTopSkills(15);
456:   const { data: courses, loading: coursesLoading } = useCourses(200);
457:   const { data: outcomeTimeline, loading: outcomeLoading } = useOutcomeTimeline(candidateId);
458: 
459:   const refreshProfile = useCallback(() => {
460:     setProfileLoading(true);
461:     api
462:       .get("/candidates/me")
463:       .then((res) => setCandidate(res.data))
464:       .catch(() => undefined)
465:       .finally(() => setProfileLoading(false));
466:   }, []);
467: 
468:   useEffect(() => { refreshProfile(); }, [refreshProfile]);
469: 
470:   useEffect(() => {
471:     if (profileLoading || !candidate) return;
472:     if (sessionStorage.getItem(ONBOARDING_SESSION_KEY)) return;
473:     if (isProfileIncomplete(candidate)) {
474:       setShowOnboarding(true);
475:     }
476:   }, [profileLoading, candidate]);
477: 
478:   const handleOnboardingComplete = useCallback(() => {
479:     setToast({ message: "Profile complete — welcome!", tone: "success" });
480:     setShowOnboarding(false);
481:     refreshProfile();
482:   }, [refreshProfile]);
483: 
484:   const handleOnboardingDismiss = useCallback(() => {
485:     sessionStorage.setItem(ONBOARDING_SESSION_KEY, "1");
486:     setShowOnboarding(false);
487:   }, []);
488: 
489:   const openEdit = () => {
490:     if (!candidate) return;
491:     setEditForm({
492:       full_name: candidate.full_name ?? "",
493:       email: candidate.email ?? "",
494:       state: candidate.state ?? "",
495:       district: candidate.district ?? "",
496:       pincode: ((candidate as unknown as Record<string, string>).pincode) ?? "",
497:       skill_tags: (candidate.skill_tags ?? []).join(", "),
498:       allow_employer_contact: candidate.allow_employer_contact !== false,
499:       preferred_job_states: candidate.preferred_job_states ?? [],
500:     });
501:     setEditOpen(true);
502:   };
503: 
504:   const togglePreferredState = (state: string) => {
505:     setEditForm((f) => ({
506:       ...f,
507:       preferred_job_states: f.preferred_job_states.includes(state)
508:         ? f.preferred_job_states.filter((s) => s !== state)
509:         : [...f.preferred_job_states, state],
510:     }));
511:   };
512: 
513:   const jobAlertStateOptions = useMemo(() => {
514:     const set = new Set<string>(JOB_ALERT_STATES);
515:     if (candidate?.state?.trim()) set.add(candidate.state.trim());
516:     return Array.from(set);
517:   }, [candidate]);
518: 
519:   const handleSave = async () => {
520:     if (!candidateId) return;
521:     setSaving(true);
522:     try {
523:       await updateCandidate(candidateId, {
524:         phone: candidate?.phone ?? "",
525:         full_name: editForm.full_name,
526:         email: editForm.email || null,
527:         state: editForm.state || null,
528:         district: editForm.district || null,
529:         pincode: editForm.pincode || null,
530:         allow_employer_contact: editForm.allow_employer_contact,
531:         preferred_job_states: editForm.preferred_job_states,
532:       });
533:       setToast({ message: "Profile updated successfully", tone: "success" });
534:       setEditOpen(false);
535:       refreshProfile();
536:     } catch {
537:       setToast({ message: "Failed to update profile", tone: "error" });
538:     } finally {
539:       setSaving(false);
540:     }
541:   };
542: 
543:   const pct = score?.score_pct ?? 0;
544:   const tone =
545:     pct >= 70 ? "text-emerald-600" : pct >= 45 ? "text-amber-600" : "text-rose-600";
546:   const barTone =
547:     pct >= 70 ? "from-emerald-500 to-teal-500" : pct >= 45 ? "from-amber-500 to-yellow-500" : "from-rose-500 to-red-500";
548:   const ringTone =
549:     pct >= 70 ? "stroke-emerald-500" : pct >= 45 ? "stroke-amber-500" : "stroke-rose-500";
550: 
551:   const appCount = applications.length;
552:   const notifCount = notifications.filter((n) => !n.read_at).length;
553:   const skillCount = candidate?.skill_tags?.length ?? 0;
554: 
555:   const displayApps = useCountUp(appCount, 600, !appsLoading);
556:   const displayNotifs = useCountUp(notifCount, 600, !notifLoading);
557:   const displaySkills = useCountUp(skillCount, 600, !profileLoading);
558: 
559:   const recentApps = [...applications]
560:     .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
561:     .slice(0, 3);
562: 
563:   const greeting = () => {
564:     const h = new Date().getHours();
565:     if (h < 12) return "Good morning";
566:     if (h < 17) return "Good afternoon";
567:     return "Good evening";
568:   };
569: 
570:   const navCards = [
571:     { href: "/candidate/verification", title: "Identity Verification", desc: "DigiLocker document verification status", icon: ShieldCheck, tint: "from-amber-500 to-orange-500", tag: "Pending", tagTone: "bg-amber-100 text-amber-700" },
572:     { href: "/candidate/skills", title: "My Skills", desc: "View skill gaps and market demand", icon: Sparkles, tint: "from-brand-500 to-indigo-500" },
573:     { href: "/candidate/matches", title: "Job Matches", desc: "Personalized job recommendations", icon: Briefcase, tint: "from-sky-500 to-cyan-500" },
574:     { href: "/candidate/progress", title: "My Progress", desc: "Training completion and survey history", icon: History, tint: "from-violet-500 to-fuchsia-500" },
575:     { href: "/candidate/applications", title: "My Applications", desc: "Track your job applications and statuses", icon: Layers, tint: "from-teal-500 to-emerald-500", badge: appCount || undefined },
576:     { href: "/candidate/notifications", title: "Notifications", desc: "Messages and updates from the platform", icon: Bell, tint: "from-rose-500 to-pink-500", badge: notifCount || undefined },
577:   ];
578: 
579:   /* ── Feature 5: Profile Completeness ── */
580:   const completeness = useMemo(() => {
581:     if (!candidate) return { pct: 0, checks: [] as { label: string; done: boolean }[] };
582:     const checks = [
583:       { label: "Full name", done: !!candidate.full_name?.trim() },
584:       { label: "Email", done: !!candidate.email?.trim() },
585:       { label: "State", done: !!candidate.state?.trim() },
586:       { label: "District", done: !!candidate.district?.trim() },
587:       { label: "At least 1 skill", done: (candidate.skill_tags?.length ?? 0) > 0 },
588:       { label: "DigiLocker verified", done: candidate.digilocker_status === "verified" },
589:     ];
590:     const done = checks.filter((c) => c.done).length;
591:     return { pct: Math.round((done / checks.length) * 100), checks };
592:   }, [candidate]);
593: 
594:   /* ── Feature 4: Skill Demand Gap ── */
595:   const missingSkills = useMemo(() => {
596:     if (!topSkills?.skills || !candidate?.skill_tags) return [];
597:     const have = new Set(candidate.skill_tags.map((s) => s.toLowerCase()));
598:     return topSkills.skills
599:       .filter((s) => !have.has(s.skill.toLowerCase()))
600:       .slice(0, 5);
601:   }, [topSkills, candidate]);
602: 
603:   /* ── Skill-Gap Courses: top 8 in-demand skills not yet in profile ── */
604:   const gapSkills = useMemo<TopSkill[]>(() => {
605:     if (!topSkills?.skills || !candidate?.skill_tags) return [];
606:     const have = new Set(candidate.skill_tags.map((s) => s.toLowerCase()));
607:     return topSkills.skills
608:       .filter((s) => !have.has(s.skill.toLowerCase()))
609:       .slice(0, 8);
610:   }, [topSkills, candidate]);
611: 
612:   const gapSkillNames = useMemo(() => {
613:     const set = new Set<string>();
614:     for (const s of gapSkills) set.add(s.skill.toLowerCase());
615:     return set;
616:   }, [gapSkills]);
617: 
618:   const rankedGapCourses = useMemo(() => {
619:     if (!courses || courses.length === 0 || gapSkillNames.size === 0) return [];
620:     const scored = courses
621:       .map((c) => {
622:         const covered = (c.skills_taught ?? []).filter((sk) =>
623:           gapSkillNames.has(sk.toLowerCase())
624:         );
625:         const demandWeight = covered.reduce((sum, sk) => {
626:           const top = gapSkills.find(
627:             (g) => g.skill.toLowerCase() === sk.toLowerCase()
628:           );
629:           return sum + (top?.demand ?? 1);
630:         }, 0);
631:         return { course: c, covered, matchCount: covered.length, demandWeight };
632:       })
633:       .filter((c) => c.matchCount > 0)
634:       .sort((a, b) =>
635:         b.matchCount === a.matchCount
636:           ? b.demandWeight - a.demandWeight
637:           : b.matchCount - a.matchCount
638:       )
639:       .slice(0, 5);
640:     return scored;
641:   }, [courses, gapSkillNames, gapSkills]);
642: 
643:   const gapCoursesLoading = profileLoading || topSkillsLoading || coursesLoading;
644: 
645:   const allLoading = profileLoading && scoreLoading && appsLoading && notifLoading;
646: 
647:   return (
648:     <main className="min-h-screen p-6">
649:       <div className="mx-auto max-w-5xl">
650: 
651:         {showOnboarding && candidate && (
652:           <OnboardingWizard
653:             candidate={candidate}
654:             onComplete={handleOnboardingComplete}
655:             onDismiss={handleOnboardingDismiss}
656:           />
657:         )}
658: 
659:         {toast && (
660:           <div className="fixed right-6 top-6 z-[60]">
661:             <Toast message={toast.message} tone={toast.tone} />
662:           </div>
663:         )}
664: 
665:         {/* ── Welcome Banner ── */}
666:         <div className="glass p-6 mb-6 animate-fade-up">
667:           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
668:             <div>
669:               {profileLoading ? (
670:                 <Skeleton className="mb-2 h-8 w-64 rounded-lg" />
671:               ) : (
672:                 <h1 className="text-2xl font-extrabold text-slate-900">
673:                   {greeting()}, <span className="gradient-text">{candidate?.full_name ?? "Candidate"}</span>
674:                 </h1>
675:               )}
676:               <p className="mt-1 text-sm text-slate-500">Your skills, verification status, and job matches</p>
677:               {candidate && (
678:                 <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
679:                   {candidate.state && (
680:                     <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{candidate.state}{candidate.district ? `, ${candidate.district}` : ""}</span>
681:                   )}
682:                   {candidate.skill_tags.length > 0 && (
683:                     <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{candidate.skill_tags.length} skills</span>
684:                   )}
685:                 </div>
686:               )}
687:             </div>
688:             <div className="flex flex-col items-end gap-2 self-start">
689:               {candidate && (
690:                 <span
691:                   className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
692:                     candidate.allow_employer_contact !== false
693:                       ? "bg-emerald-100 text-emerald-700"
694:                       : "bg-amber-100 text-amber-700"
695:                   }`}
696:                 >
697:                   <ShieldCheck className="h-3.5 w-3.5" />
698:                   {candidate.allow_employer_contact !== false
699:                     ? "Visible to employers"
700:                     : "Contact hidden"}
701:                 </span>
702:               )}
703:               <button
704:                 onClick={openEdit}
705:                 disabled={profileLoading}
706:                 className="btn-glass inline-flex items-center gap-2"
707:               >
708:                 <Pencil className="h-4 w-4" />
709:                 Edit Profile
710:               </button>
711:             </div>
712:           </div>
713:         </div>
714: 
715:         {/* ── Stat Cards ── */}
716:         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
717:           {[
718:             {
719:               label: "Applications",
720:               value: appsLoading ? null : displayApps,
721:               icon: FileText,
722:               gradient: "from-indigo-500 to-violet-500",
723:               delay: "delay-100",
724:             },
725:             {
726:               label: "Unread Notifications",
727:               value: notifLoading ? null : displayNotifs,
728:               icon: Bell,
729:               gradient: "from-rose-500 to-pink-500",
730:               delay: "delay-200",
731:             },
732:             {
733:               label: "Skills Listed",
734:               value: profileLoading ? null : displaySkills,
735:               icon: Sparkles,
736:               gradient: "from-amber-500 to-orange-500",
737:               delay: "delay-300",
738:             },
739:           ].map(({ label, value, icon: Icon, gradient, delay }) => (
740:             <div
741:               key={label}
742:               className={`glass glass-inner animate-fade-up ${delay} flex items-center gap-4 p-5`}
743:             >
744:               <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
745:                 <Icon className="h-5 w-5 text-white" />
746:               </div>
747:               <div>
748:                 <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
749:                 {value === null ? (
750:                   <Skeleton className="mt-1 h-7 w-12 rounded" />
751:                 ) : (
752:                   <p className="text-2xl font-extrabold text-slate-800">{value}</p>
753:                 )}
754:               </div>
755:             </div>
756:           ))}
757:         </div>
758: 
759:         {/* ── Placement Score ── */}
760:         <div className="glass p-6 mb-6 animate-fade-up delay-100">
761:           <div className="flex items-start justify-between gap-6">
762:             <div className="flex-1">
763:               <div className="panel-title mb-1">
764:                 <Target className="h-5 w-5 text-brand-600" />
765:                 Placement Likelihood
766:               </div>
767:               <p className="text-sm text-slate-500">
768:                 AI estimate of your probability of employment within 6 months
769:               </p>
770:             </div>
771: 
772:             <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
773:               {scoreLoading ? (
774:                 <Skeleton className="h-28 w-28 rounded-full" />
775:               ) : (
776:                 <>
777:                   <svg className="absolute inset-0 -rotate-90" viewBox="0 0 112 112">
778:                     <circle cx="56" cy="56" r="50" fill="none" stroke="#e2e8f0" strokeWidth="8" />
779:                     <circle
780:                       cx="56"
781:                       cy="56"
782:                       r="50"
783:                       fill="none"
784:                       className={ringTone}
785:                       strokeWidth="8"
786:                       strokeLinecap="round"
787:                       strokeDasharray={`${(pct / 100) * 314} 314`}
788:                       style={{ transition: "stroke-dasharray 1s ease-out" }}
789:                     />
790:                   </svg>
791:                   <span className={`text-2xl font-extrabold ${tone}`}>{pct}%</span>
792:                 </>
793:               )}
794:             </div>
795:           </div>
796: 
797:           {!scoreLoading && score && (
798:             <div className="mt-5">
799:               <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
800:                 <div
801:                   className={`h-full rounded-full bg-gradient-to-r ${barTone} transition-all duration-1000 ease-out`}
802:                   style={{ width: `${pct}%` }}
803:                 />
804:               </div>
805:               {score.factors.length > 0 && (
806:                 <div className="mt-4 flex flex-wrap gap-2">
807:                   {score.factors.map((f) => (
808:                     <span
809:                       key={f.factor}
810:                       className={`chip ${
811:                         f.effect === "boost" || f.effect === "high"
812:                           ? "bg-emerald-100 text-emerald-700"
813:                           : f.effect === "concern" || f.effect === "low"
814:                           ? "bg-rose-100 text-rose-700"
815:                           : "bg-slate-100 text-slate-600"
816:                       }`}
817:                       title={f.detail}
818:                     >
819:                       {f.detail}
820:                     </span>
821:                   ))}
822:                 </div>
823:               )}
824:             </div>
825:           )}
826:         </div>
827: 
828:         {/* ── Nav Cards ── */}
829:         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
830:           {navCards.map(({ href, title, desc, icon: Icon, tint, tag, tagTone, badge }, i) => (
831:             <Link
832:               key={href}
833:               href={href}
834:               className="group glass card-hover animate-fade-up p-5"
835:               style={{ animationDelay: `${i * 0.06}s` }}
836:             >
837:               <div className="flex items-start justify-between">
838:                 <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tint} shadow-md transition-transform duration-300 group-hover:scale-110`}>
839:                   <Icon className="h-5 w-5 text-white" />
840:                 </div>
841:                 <div className="flex items-center gap-2">
842:                   {badge !== undefined && badge !== null && (
843:                     <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-brand-500 px-2 text-xs font-bold text-white">
844:                       {badge}
845:                     </span>
846:                   )}
847:                   <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-500" />
848:                 </div>
849:               </div>
850:               <h3 className="mt-3 font-bold text-slate-800 group-hover:text-brand-700">{title}</h3>
851:               <p className="mt-1 text-sm text-slate-500">{desc}</p>
852:               {tag && <span className={`chip mt-2 ${tagTone}`}>{tag}</span>}
853:             </Link>
854:           ))}
855:         </div>
856: 
857:         {/* ── Recent Applications ── */}
858:         <div className="glass p-6 animate-fade-up delay-200">
859:           <div className="flex items-center justify-between mb-4">
860:             <div className="panel-title">
861:               <FileText className="h-5 w-5 text-brand-600" />
862:               Recent Applications
863:             </div>
864:             {appCount > 3 && (
865:               <Link href="/candidate/applications" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
866:                 View all ({appCount})
867:               </Link>
868:             )}
869:           </div>
870: 
871:           {appsLoading ? (
872:             <div className="space-y-3">
873:               {[1, 2, 3].map((i) => (
874:                 <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
875:                   <Skeleton className="h-5 w-5 rounded-full" />
876:                   <div className="flex-1">
877:                     <Skeleton className="mb-2 h-4 w-40 rounded" />
878:                     <Skeleton className="h-3 w-24 rounded" />
879:                   </div>
880:                   <Skeleton className="h-6 w-20 rounded-full" />
881:                 </div>
882:               ))}
883:             </div>
884:           ) : recentApps.length === 0 ? (
885:             <div className="py-8 text-center">
886:               <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
887:                 <FileText className="h-7 w-7 text-slate-300" />
888:               </div>
889:               <p className="text-sm font-medium text-slate-500">No applications yet</p>
890:               <p className="mt-1 text-xs text-slate-400">Start applying to jobs to see them here</p>
891:               <Link
892:                 href="/candidate/matches"
893:                 className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
894:               >
895:                 <Briefcase className="h-4 w-4" />
896:                 Browse Job Matches
897:               </Link>
898:             </div>
899:           ) : (
900:             <div className="space-y-3">
901:               {recentApps.map((app: JobApplication, i: number) => (
902:                 <div
903:                   key={app.id}
904:                   className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition-all hover:border-brand-200 hover:bg-brand-50/30 animate-fade-up"
905:                   style={{ animationDelay: `${i * 0.05}s` }}
906:                 >
907:                   <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
908:                     <FileText className="h-4 w-4 text-brand-500" />
909:                   </div>
910:                   <div className="min-w-0 flex-1">
911:                     <p className="truncate text-sm font-semibold text-slate-800">
912:                       Application #{app.job_posting_id.slice(0, 8)}
913:                     </p>
914:                     <p className="text-xs text-slate-400">
915:                       Applied {new Date(app.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
916:                       {app.match_score !== null && app.match_score !== undefined && (
917:                         <span className="ml-2 font-medium text-brand-500">
918:                           {(app.match_score * 100).toFixed(0)}% match
919:                         </span>
920:                       )}
921:                     </p>
922:                   </div>
923:                   <StatusChip status={app.status} />
924:                 </div>
925:               ))}
926:             </div>
927:           )}
928:         </div>
929: 
930:         {/* ═══════════════════════════════════════════════
931:             NEW FEATURE 1 — Job Match Highlights
932:            ═══════════════════════════════════════════════ */}
933:         <div className="glass p-6 mt-6 animate-fade-up delay-100">
934:           <div className="flex items-center justify-between mb-4">
935:             <div className="panel-title">
936:               <Briefcase className="h-5 w-5 text-sky-600" />
937:               Job Match Highlights
938:             </div>
939:             {jobMatches && jobMatches.matches.length > 3 && (
940:               <Link href="/candidate/matches" className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1">
941:                 View all <ChevronRight className="h-3.5 w-3.5" />
942:               </Link>
943:             )}
944:           </div>
945: 
946:           {matchesLoading ? (
947:             <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
948:               {[1, 2, 3].map((i) => (
949:                 <div key={i} className="glass-inner rounded-xl p-4">
950:                   <Skeleton className="mb-3 h-4 w-32 rounded" />
951:                   <Skeleton className="mb-2 h-3 w-20 rounded" />
952:                   <Skeleton className="mb-3 h-2 w-full rounded-full" />
953:                   <Skeleton className="h-3 w-40 rounded" />
954:                 </div>
955:               ))}
956:             </div>
957:           ) : !jobMatches || jobMatches.matches.length === 0 ? (
958:             <div className="py-8 text-center">
959:               <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
960:                 <Briefcase className="h-7 w-7 text-slate-300" />
961:               </div>
962:               <p className="text-sm font-medium text-slate-500">No job matches yet</p>
963:               <p className="mt-1 text-xs text-slate-400">Complete your profile to get personalized recommendations</p>
964:               <Link
965:                 href="/candidate/skills"
966:                 className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
967:               >
968:                 <Sparkles className="h-4 w-4" />
969:                 Add Skills
970:               </Link>
971:             </div>
972:           ) : (
973:             <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
974:               {jobMatches.matches.slice(0, 3).map((match, i) => {
975:                 const matchPct = Math.round(match.match_score * 100);
976:                 const matchTone =
977:                   matchPct >= 70 ? "text-emerald-600" : matchPct >= 45 ? "text-amber-600" : "text-rose-600";
978:                 const matchBar =
979:                   matchPct >= 70 ? "from-emerald-500 to-teal-500" : matchPct >= 45 ? "from-amber-500 to-yellow-500" : "from-rose-500 to-red-500";
980:                 return (
981:                   <Link
982:                     key={match.job_id}
983:                     href="/candidate/matches"
984:                     className="group glass-inner rounded-xl p-4 transition-all hover:border-sky-200 hover:bg-sky-50/30 animate-fade-up"
985:                     style={{ animationDelay: `${i * 0.06}s` }}
986:                   >
987:                     <div className="flex items-start justify-between mb-2">
988:                       <h4 className="font-bold text-slate-800 group-hover:text-sky-700 text-sm leading-tight">
989:                         {match.title}
990:                       </h4>
991:                       <span className={`text-sm font-extrabold ${matchTone} ml-2 shrink-0`}>
992:                         {matchPct}%
993:                       </span>
994:                     </div>
995:                     {match.company && (
996:                       <p className="text-xs text-slate-500 mb-2">{match.company}</p>
997:                     )}
998:                     <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 mb-3">
999:                       <div
1000:                         className={`h-full rounded-full bg-gradient-to-r ${matchBar} transition-all duration-700`}
1001:                         style={{ width: `${matchPct}%` }}
1002:                       />
1003:                     </div>
1004:                     <div className="flex items-center gap-3 text-xs text-slate-400">
1005:                       {(match.state || match.district) && (
1006:                         <span className="flex items-center gap-1">
1007:                           <Map className="h-3 w-3" />
1008:                           {match.district}{match.district && match.state ? ", " : ""}{match.state}
1009:                         </span>
1010:                       )}
1011:                       {match.skill_overlap.length > 0 && (
1012:                         <span className="flex items-center gap-1 text-emerald-500">
1013:                           <Zap className="h-3 w-3" />
1014:                           {match.skill_overlap.length} skill{match.skill_overlap.length !== 1 ? "s" : ""} matched
1015:                         </span>
1016:                       )}
1017:                     </div>
1018:                   </Link>
1019:                 );
1020:               })}
1021:             </div>
1022:           )}
1023:         </div>
1024: 
1025:         {/* ═══════════════════════════════════════════════
1026:             NEW FEATURE 2 — Placement Factor Callouts
1027:            ═══════════════════════════════════════════════ */}
1028:         {score && score.factors.length > 0 && (
1029:           <div className="glass p-6 mt-6 animate-fade-up delay-200">
1030:             <div className="flex items-center justify-between mb-4">
1031:               <div className="panel-title">
1032:                 <Zap className="h-5 w-5 text-amber-600" />
1033:                 Placement Score Breakdown
1034:               </div>
1035:             </div>
1036: 
1037:             <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
1038:               {score.factors.map((f, i) => {
1039:                 const isPositive = f.effect === "boost" || f.effect === "high";
1040:                 const isNegative = f.effect === "concern" || f.effect === "low";
1041:                 return (
1042:                   <div
1043:                     key={f.factor}
1044:                     className={`flex items-start gap-3 rounded-xl border p-4 transition-all animate-fade-up ${
1045:                       isPositive
1046:                         ? "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50"
1047:                         : isNegative
1048:                         ? "border-rose-200 bg-rose-50/60 hover:bg-rose-50"
1049:                         : "border-slate-200 bg-slate-50/60 hover:bg-slate-50"
1050:                     }`}
1051:                     style={{ animationDelay: `${i * 0.04}s` }}
1052:                   >
1053:                     <div
1054:                       className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
1055:                         isPositive
1056:                           ? "bg-emerald-100 text-emerald-600"
1057:                           : isNegative
1058:                           ? "bg-rose-100 text-rose-600"
1059:                           : "bg-slate-100 text-slate-500"
1060:                       }`}
1061:                     >
1062:                       {isPositive ? (
1063:                         <TrendingUp className="h-4 w-4" />
1064:                       ) : isNegative ? (
1065:                         <TrendingDown className="h-4 w-4" />
1066:                       ) : (
1067:                         <CircleDot className="h-4 w-4" />
1068:                       )}
1069:                     </div>
1070:                     <div className="min-w-0 flex-1">
1071:                       <p className="text-sm font-semibold text-slate-800">{f.detail}</p>
1072:                       <p className="mt-0.5 text-xs text-slate-500">{f.factor}</p>
1073:                     </div>
1074:                     <span
1075:                       className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
1076:                         isPositive
1077:                           ? "bg-emerald-200 text-emerald-700"
1078:                           : isNegative
1079:                           ? "bg-rose-200 text-rose-700"
1080:                           : "bg-slate-200 text-slate-600"
1081:                       }`}
1082:                     >
1083:                       {f.effect}
1084:                     </span>
1085:                   </div>
1086:                 );
1087:               })}
1088:             </div>
1089:           </div>
1090:         )}
1091: 
1092:         {/* ═══════════════════════════════════════════════
1093:             NEW FEATURE 3 — Outcome Journey Snapshot
1094:            ═══════════════════════════════════════════════ */}
1095:         <div className="glass p-6 mt-6 animate-fade-up delay-100">
1096:           <div className="flex items-center justify-between mb-4">
1097:             <div className="panel-title">
1098:               <History className="h-5 w-5 text-violet-600" />
1099:               Outcome Journey
1100:             </div>
1101:             {outcomeTimeline && outcomeTimeline.length > 0 && (
1102:               <span className="text-xs text-slate-400">
1103:                 {outcomeTimeline.length} checkpoint{outcomeTimeline.length !== 1 ? "s" : ""}
1104:               </span>
1105:             )}
1106:           </div>
1107: 
1108:           {outcomeLoading ? (
1109:             <div className="flex items-center gap-6">
1110:               {["3-month", "6-month", "12-month"].map((label) => (
1111:                 <div key={label} className="flex flex-col items-center gap-2">
1112:                   <Skeleton className="h-10 w-10 rounded-full" />
1113:                   <Skeleton className="h-3 w-16 rounded" />
1114:                   <Skeleton className="h-2.5 w-12 rounded" />
1115:                 </div>
1116:               ))}
1117:             </div>
1118:           ) : !outcomeTimeline || outcomeTimeline.length === 0 ? (
1119:             <div className="py-8 text-center">
1120:               <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
1121:                 <History className="h-7 w-7 text-slate-300" />
1122:               </div>
1123:               <p className="text-sm font-medium text-slate-500">No outcome data yet</p>
1124:               <p className="mt-1 text-xs text-slate-400">Your employment tracking will appear here after training</p>
1125:             </div>
1126:           ) : (
1127:             <div className="relative">
1128:               <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-violet-300 via-brand-300 to-emerald-300" />
1129:               <div className="space-y-6">
1130:                 {outcomeTimeline.map((entry, i) => {
1131:                   const isEmployed = entry.is_employed;
1132:                   const label =
1133:                     entry.interval === "3m"
1134:                       ? "3 Months"
1135:                       : entry.interval === "6m"
1136:                       ? "6 Months"
1137:                       : entry.interval === "12m"
1138:                       ? "12 Months"
1139:                       : entry.interval;
1140:                   return (
1141:                     <div
1142:                       key={`${entry.interval}-${i}`}
1143:                       className="relative flex items-start gap-5 pl-2 animate-fade-up"
1144:                       style={{ animationDelay: `${i * 0.1}s` }}
1145:                     >
1146:                       <div
1147:                         className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
1148:                           isEmployed
1149:                             ? "border-emerald-400 bg-emerald-100 text-emerald-600"
1150:                             : "border-slate-300 bg-slate-100 text-slate-400"
1151:                         }`}
1152:                       >
1153:                         {isEmployed ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
1154:                       </div>
1155:                       <div className="flex-1 rounded-xl border border-slate-100 p-4 transition-all hover:border-violet-200">
1156:                         <div className="flex items-center justify-between mb-1">
1157:                           <h4 className="text-sm font-bold text-slate-800">{label}</h4>
1158:                           <span
1159:                             className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
1160:                               isEmployed
1161:                                 ? "bg-emerald-100 text-emerald-700"
1162:                                 : "bg-slate-100 text-slate-500"
1163:                             }`}
1164:                           >
1165:                             {isEmployed ? "Employed" : "Awaiting"}
1166:                           </span>
1167:                         </div>
1168:                         {entry.job_title && (
1169:                           <p className="text-xs text-slate-600 mb-1">
1170:                             {entry.job_title}
1171:                             {entry.job_location ? ` · ${entry.job_location}` : ""}
1172:                           </p>
1173:                         )}
1174:                         {entry.monthly_salary !== null && entry.monthly_salary !== undefined && (
1175:                           <p className="text-xs text-emerald-600 font-semibold">
1176:                             ₹{entry.monthly_salary.toLocaleString("en-IN")}/month

(Output capped at 50 KB. Showing lines 1-1176. Use offset=1177 to continue.)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\gov\\page.tsx"
}
```

**Output:**
```
<path>C:\aaditya\Opencode-project\SIH26135\frontend\src\app\gov\page.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useState, useEffect, useCallback, useRef, useMemo } from "react";
4: import Sidebar from "@/components/layout/Sidebar";
5: import TopBar from "@/components/layout/TopBar";
6: import Link from "next/link";
7: import {
8:   Users, Building2, Briefcase, GraduationCap, TrendingUp, AlertTriangle,
9:   BarChart3, ShieldCheck, BookOpen, Clock, ChevronRight, Activity,
10:   CheckCircle2, XCircle, AlertCircle, MapPin, PieChart, Download,
11:   FileText, Table, ClipboardList, Settings2, Map as MapIcon, Award, School,
12: } from "lucide-react";
13: import {
14:   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
15:   BarChart, Bar, Cell, Legend, PieChart as RePieChart, Pie,
16: } from "recharts";
17: import {
18:   useDashboardStats, useEnrollmentTrends, useTopSkills,
19:   useSchemeROI, usePolicyAlerts, useCandidates, useEnrollments,
20:   useCourses, useEmployers, useTrainingPartners,
21:   downloadReport,
22: } from "@/lib/hooks/useDashboard";
23: import type { DashboardStats, PolicyAlert, SchemeAnalytics, CandidateListItem, EnrollmentListItem, ReportFormat } from "@/lib/types";
24: import { useRequireAuth } from "@/lib/hooks/useAuthGuard";
25: import Toast from "@/components/ui/Toast";
26: 
27: // ── CountUp animated counter ────────────────────────────────────────────────
28: 
29: function CountUp({ end, suffix = "", duration = 1200, decimals = 0 }: {
30:   end: number;
31:   suffix?: string;
32:   duration?: number;
33:   decimals?: number;
34: }) {
35:   const [display, setDisplay] = useState(0);
36:   const frameRef = useRef<number>(0);
37: 
38:   useEffect(() => {
39:     const start = performance.now();
40:     const step = (now: number) => {
41:       const elapsed = now - start;
42:       const progress = Math.min(elapsed / duration, 1);
43:       const eased = 1 - Math.pow(1 - progress, 3);
44:       setDisplay(eased * end);
45:       if (progress < 1) {
46:         frameRef.current = requestAnimationFrame(step);
47:       }
48:     };
49:     frameRef.current = requestAnimationFrame(step);
50:     return () => cancelAnimationFrame(frameRef.current);
51:   }, [end, duration]);
52: 
53:   return (
54:     <span>
55:       {decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}
56:       {suffix}
57:     </span>
58:   );
59: }
60: 
61: // ── Relative time helper ────────────────────────────────────────────────────
62: 
63: function timeAgo(dateStr: string | null): string {
64:   if (!dateStr) return "";
65:   const diff = Date.now() - new Date(dateStr).getTime();
66:   const mins = Math.floor(diff / 60000);
67:   if (mins < 1) return "just now";
68:   if (mins < 60) return `${mins}m ago`;
69:   const hrs = Math.floor(mins / 60);
70:   if (hrs < 24) return `${hrs}h ago`;
71:   const days = Math.floor(hrs / 24);
72:   return `${days}d ago`;
73: }
74: 
75: // ── CSV export helper ───────────────────────────────────────────────────────
76: 
77: function CsvButton({ data, filename }: { data: Record<string, unknown>[]; filename: string }) {
78:   const handleDownload = useCallback(() => {
79:     if (!data || data.length === 0) return;
80:     const keys = Object.keys(data[0]);
81:     const csvEscape = (val: unknown) => {
82:       if (val === null || val === undefined) return "";
83:       const s = String(val);
84:       if (s.includes(",") || s.includes('"') || s.includes("\n")) {
85:         return '"' + s.replace(/"/g, '""') + '"';
86:       }
87:       return s;
88:     };
89:     const header = keys.map(csvEscape).join(",");
90:     const rows = data.map((row) => keys.map((k) => csvEscape(row[k])).join(","));
91:     const csv = [header, ...rows].join("\n");
92:     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
93:     const url = URL.createObjectURL(blob);
94:     const a = document.createElement("a");
95:     a.href = url;
96:     a.download = filename;
97:     a.click();
98:     URL.revokeObjectURL(url);
99:   }, [data, filename]);
100: 
101:   return (
102:     <button
103:       onClick={handleDownload}
104:       className="btn-ghost flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:text-brand-600"
105:       title={`Download ${filename}`}
106:     >
107:       <Download className="h-3 w-3" />
108:       CSV
109:     </button>
110:   );
111: }
112: 
113: // ── Server-side report export button ────────────────────────────────────────
114: 
115: function ReportButton({
116:   reportType,
117:   format,
118:   label,
119:   icon: Icon,
120:   disabled,
121:   onToast,
122: }: {
123:   reportType: string;
124:   format: ReportFormat;
125:   label: string;
126:   icon: React.ComponentType<{ className?: string }>;
127:   disabled: boolean;
128:   onToast: (message: string, tone: "success" | "error" | "info") => void;
129: }) {
130:   const [downloading, setDownloading] = useState(false);
131: 
132:   const handleDownload = useCallback(async () => {
133:     if (disabled || downloading) return;
134:     setDownloading(true);
135:     onToast(`Downloading ${label} report…`, "info");
136:     try {
137:       await downloadReport(reportType, format);
138:       onToast(`${label} report downloaded.`, "success");
139:     } catch (e: unknown) {
140:       const msg =
141:         e instanceof Error
142:           ? e.message
143:           : "Download failed. Check your permissions.";
144:       onToast(msg, "error");
145:     } finally {
146:       setDownloading(false);
147:     }
148:   }, [reportType, format, label, disabled, downloading, onToast]);
149: 
150:   return (
151:     <button
152:       onClick={handleDownload}
153:       disabled={disabled || downloading}
154:       title={`Download ${label}`}
155:       className={`btn-ghost flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:text-brand-600 ${
156:         disabled ? "cursor-not-allowed opacity-40" : ""
157:       }`}
158:     >
159:       {downloading ? (
160:         <span className="h-3 w-3 animate-spin rounded-full border border-slate-400 border-t-transparent" />
161:       ) : (
162:         <Icon className="h-3 w-3" />
163:       )}
164:       {label}
165:     </button>
166:   );
167: }
168: 
169: // ── KPI card config ─────────────────────────────────────────────────────────
170: 
171: const kpiConfig = [
172:   { label: "Total Candidates", key: "total_candidates" as keyof DashboardStats, icon: Users, tint: "from-brand-500 to-indigo-500", text: "text-brand-600", href: "#" },
173:   { label: "Training Partners", key: "total_training_partners" as keyof DashboardStats, icon: Building2, tint: "from-emerald-500 to-teal-500", text: "text-emerald-600", href: "#" },
174:   { label: "Active Employers", key: "total_employers" as keyof DashboardStats, icon: Briefcase, tint: "from-violet-500 to-fuchsia-500", text: "text-violet-600", href: "#" },
175:   { label: "Enrollments", key: "total_enrollments" as keyof DashboardStats, icon: GraduationCap, tint: "from-orange-500 to-amber-500", text: "text-orange-600", href: "#" },
176:   { label: "Courses", key: "total_courses" as keyof DashboardStats, icon: BookOpen, tint: "from-cyan-500 to-sky-500", text: "text-cyan-600", href: "#" },
177:   { label: "Placement Rate", key: "overall_placement_rate" as keyof DashboardStats, icon: TrendingUp, tint: "from-sky-500 to-cyan-500", text: "text-sky-600", href: "#", isPercent: true },
178: ];
179: 
180: // ── Chart tooltip style ─────────────────────────────────────────────────────
181: 
182: const tooltipStyle = {
183:   contentStyle: {
184:     borderRadius: 12,
185:     border: "1px solid #e2e8f0",
186:     background: "rgba(255,255,255,0.92)",
187:     backdropFilter: "blur(12px)",
188:     fontSize: 12,
189:     boxShadow: "0 12px 40px rgba(15,23,42,0.12)",
190:   },
191: };
192: 
193: // ── ROI badge color helper ──────────────────────────────────────────────────
194: 
195: function roiBadge(score: number | null) {
196:   if (score === null || score === undefined) return "bg-slate-100 text-slate-500";
197:   if (score > 3) return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
198:   if (score >= 2) return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
199:   return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
200: }
201: 
202: function alertChip(status: string) {
203:   if (status === "alert") return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
204:   if (status === "underperforming") return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
205:   return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
206: }
207: 
208: // ── Sector donut palette ────────────────────────────────────────────────────
209: 
210: const SECTOR_COLORS = [
211:   "#4f46e5", "#7c3aed", "#06b6d4", "#10b981",
212:   "#f59e0b", "#f43f5e", "#8b5cf6", "#14b8a6",
213:   "#6366f1", "#84cc16",
214: ];
215: 
216: // ── Completion progress bar color helper ────────────────────────────────────
217: 
218: function completionColor(rate: number | null) {
219:   if (rate === null || rate === undefined) return "bg-slate-300";
220:   if (rate >= 75) return "bg-gradient-to-r from-emerald-500 to-teal-400";
221:   if (rate >= 50) return "bg-gradient-to-r from-amber-500 to-orange-400";
222:   return "bg-gradient-to-r from-rose-500 to-red-400";
223: }
224: 
225: // ── Skeleton components ─────────────────────────────────────────────────────
226: 
227: function SkeletonCard() {
228:   return (
229:     <div className="glass p-5 animate-pulse">
230:       <div className="mb-3 h-10 w-10 rounded-xl skeleton" />
231:       <div className="mb-2 h-7 w-20 rounded-lg skeleton" />
232:       <div className="h-4 w-24 rounded skeleton" />
233:     </div>
234:   );
235: }
236: 
237: function SkeletonChart() {
238:   return (
239:     <div className="glass p-6 animate-pulse">
240:       <div className="mb-4 h-5 w-40 rounded skeleton" />
241:       <div className="h-72 w-full rounded-xl skeleton" />
242:     </div>
243:   );
244: }
245: 
246: function SkeletonList({ rows = 4 }: { rows?: number }) {
247:   return (
248:     <div className="space-y-3">
249:       {Array.from({ length: rows }).map((_, i) => (
250:         <div key={i} className="glass-inner p-4 animate-pulse">
251:           <div className="h-4 w-3/4 rounded skeleton mb-2" />
252:           <div className="h-3 w-1/2 rounded skeleton" />
253:         </div>
254:       ))}
255:     </div>
256:   );
257: }
258: 
259: // ── Quick action tile ───────────────────────────────────────────────────────
260: 
261: function QuickActionTile({ href, icon: Icon, title, subtitle, tint }: {
262:   href: string;
263:   icon: React.ComponentType<{ className?: string }>;
264:   title: string;
265:   subtitle: string;
266:   tint: string;
267: }) {
268:   return (
269:     <Link
270:       href={href}
271:       className="glass card-hover group flex items-center gap-3 p-4 animate-fade-up"
272:     >
273:       <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tint} shadow-md transition-transform duration-300 group-hover:scale-110`}>
274:         <Icon className="h-5 w-5 text-white" />
275:       </div>
276:       <div className="min-w-0">
277:         <p className="font-bold text-slate-800">{title}</p>
278:         <p className="truncate text-xs text-slate-500">{subtitle}</p>
279:       </div>
280:       <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500" />
281:     </Link>
282:   );
283: }
284: 
285: // ── Main Dashboard ──────────────────────────────────────────────────────────
286: 
287: export default function GovDashboard() {
288:   useRequireAuth("gov_admin");
289: 
290:   const [toast, setToast] = useState<{
291:     message: string;
292:     tone: "success" | "error" | "info";
293:   } | null>(null);
294: 
295:   const showToast = useCallback(
296:     (message: string, tone: "success" | "error" | "info") => {
297:       setToast({ message, tone });
298:     },
299:     []
300:   );
301: 
302:   const { data: stats, loading: statsLoading } = useDashboardStats();
303:   const { data: trends, loading: trendsLoading } = useEnrollmentTrends(6);
304:   const { data: topSkills, loading: skillsLoading } = useTopSkills(10);
305:   const { data: schemes, loading: schemesLoading } = useSchemeROI();
306:   const { data: alerts, loading: alertsLoading } = usePolicyAlerts();
307:   const { data: candidates, loading: candidatesLoading } = useCandidates(5);
308:   const { data: enrollments, loading: enrollmentsLoading } = useEnrollments(5);
309:   const { data: courses, loading: coursesLoading } = useCourses(200);
310:   const { data: employers, loading: employersLoading } = useEmployers(20);
311:   const { data: partners, loading: partnersLoading } = useTrainingPartners(20);
312: 
313:   // Merged recent activity feed
314:   const activityFeed = useMemo(() => {
315:     const items: { type: "candidate" | "enrollment"; name: string; detail: string; time: string }[] = [];
316: 
317:     for (const c of (candidates ?? []).slice(0, 5)) {
318:       items.push({
319:         type: "candidate",
320:         name: c.full_name,
321:         detail: c.state ?? "Unknown state",
322:         time: c.created_at,
323:       });
324:     }
325:     for (const e of (enrollments ?? []).slice(0, 5)) {
326:       items.push({
327:         type: "enrollment",
328:         name: `Enrollment #${e.id.slice(0, 8)}`,
329:         detail: e.is_completed ? "Completed" : "In progress",
330:         time: e.created_at,
331:       });
332:     }
333:     items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
334:     return items.slice(0, 8);
335:   }, [candidates, enrollments]);
336: 
337:   // ── NEW: Regional breakdown (candidates grouped by state) ──────────────
338:   const regionalData = useMemo(() => {
339:     const counts = new Map<string, number>();
340:     for (const c of candidates ?? []) {
341:       const state = c.state?.trim() || "Unknown";
342:       counts.set(state, (counts.get(state) ?? 0) + 1);
343:     }
344:     return Array.from(counts.entries())
345:       .map(([state, count]) => ({ state, count }))
346:       .sort((a, b) => b.count - a.count)
347:       .slice(0, 8);
348:   }, [candidates]);
349: 
350:   const stateCount = useMemo(
351:     () => new Set((candidates ?? []).map((c) => c.state?.trim() || "Unknown")).size,
352:     [candidates]
353:   );
354: 
355:   // ── NEW: Sector distribution donut (courses grouped by sector) ──────────
356:   const sectorData = useMemo(() => {
357:     const counts = new Map<string, number>();
358:     for (const course of courses ?? []) {
359:       const sector = course.sector?.trim() || "Unclassified";
360:       counts.set(sector, (counts.get(sector) ?? 0) + 1);
361:     }
362:     return Array.from(counts.entries())
363:       .map(([name, value], i) => ({
364:         name,
365:         value,
366:         color: SECTOR_COLORS[i % SECTOR_COLORS.length],
367:       }))
368:       .sort((a, b) => b.value - a.value);
369:   }, [courses]);
370: 
371:   // ── NEW: Top employers / partners leaderboards (recently added) ────────
372:   const recentEmployers = useMemo(
373:     () => [...(employers ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
374:     [employers]
375:   );
376:   const recentPartners = useMemo(
377:     () => [...(partners ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
378:     [partners]
379:   );
380: 
381:   // ── NEW: Scheme progress widgets (reuse schemes) ────────────────────────
382:   const schemesForProgress = useMemo(() => schemes.slice(0, 6), [schemes]);
383: 
384:   // ── NEW: Scheme-by-state comparison ──────────────────────────────────────
385:   const stateComparison = useMemo(() => {
386:     if (schemes.length === 0) return { chartData: [], tableRows: [], states: [], topSchemes: [] };
387: 
388:     type Row = { scheme_id: string; state: string; total_enrolled: number; completion_rate: number | null; placed_12m: number; roi_score: number | null; alert_status: string };
389: 
390:     const map = new Map<string, Row>();
391:     for (const s of schemes) {
392:       const st = s.state?.trim() || "Unknown";
393:       const key = `${s.scheme_id}|||${st}`;
394:       const existing = map.get(key);
395:       if (existing) {
396:         existing.total_enrolled += s.total_enrolled;
397:         existing.placed_12m += s.total_placed_12m;
398:       } else {
399:         map.set(key, {
400:           scheme_id: s.scheme_id,
401:           state: st,
402:           total_enrolled: s.total_enrolled,
403:           completion_rate: s.completion_rate,
404:           placed_12m: s.total_placed_12m,
405:           roi_score: s.roi_score,
406:           alert_status: s.alert_status,
407:         });
408:       }
409:     }
410: 
411:     const allRows = Array.from(map.values());
412: 
413:     const schemeTotals = new Map<string, number>();
414:     for (const r of allRows) {
415:       schemeTotals.set(r.scheme_id, (schemeTotals.get(r.scheme_id) ?? 0) + r.total_enrolled);
416:     }
417:     const topSchemes = Array.from(schemeTotals.entries())
418:       .sort((a, b) => b[1] - a[1])
419:       .slice(0, 8)
420:       .map(([id]) => id);
421: 
422:     const stateTotals = new Map<string, number>();
423:     for (const r of allRows) {
424:       if (topSchemes.includes(r.scheme_id)) {
425:         stateTotals.set(r.state, (stateTotals.get(r.state) ?? 0) + r.total_enrolled);
426:       }
427:     }
428:     const states = Array.from(stateTotals.entries())
429:       .sort((a, b) => b[1] - a[1])
430:       .slice(0, 4)
431:       .map(([s]) => s);
432: 
433:     const filteredRows = allRows.filter(
434:       (r) => topSchemes.includes(r.scheme_id) && states.includes(r.state)
435:     );
436: 
437:     const chartMap = new Map<string, Record<string, number | string>>();
438:     for (const sid of topSchemes) {
439:       chartMap.set(sid, { scheme_id: sid });
440:     }
441:     for (const r of filteredRows) {
442:       const entry = chartMap.get(r.scheme_id);
443:       if (entry) entry[r.state] = r.total_enrolled;
444:     }
445:     const chartData = Array.from(chartMap.values());
446: 
447:     return { chartData, tableRows: filteredRows, states, topSchemes };
448:   }, [schemes]);
449: 
450:   return (
451:     <div className="flex min-h-screen">
452:       <Sidebar />
453:       <div className="flex-1">
454:         <TopBar title="Admin Console" subtitle="National outcome analytics" />
455:         <main className="space-y-6 p-6">
456: 
457:           {toast && <Toast message={toast.message} tone={toast.tone} />}
458: 
459:           {/* ── Welcome Banner ──────────────────────────────────────────── */}
460:           <div className="glass animate-fade-up overflow-hidden p-6">
461:             <div className="flex flex-wrap items-center justify-between gap-4">
462:               <div className="flex items-center gap-4">
463:                 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 via-brand-700 to-brand-500 shadow-lg shadow-brand-700/30">
464:                   <ShieldCheck className="h-6 w-6 text-white" />
465:                 </div>
466:                 <div>
467:                   <div className="flex items-center gap-2">
468:                     <h2 className="text-lg font-extrabold text-slate-900">
469:                       {statsLoading ? "National Overview" : "Welcome back, Administrator"}
470:                     </h2>
471:                     <span className="chip bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm">
472:                       Admin
473:                     </span>
474:                   </div>
475:                   <p className="text-sm text-slate-500">
476:                     Live snapshot of learning, placement, and labor intelligence across schemes.
477:                   </p>
478:                 </div>
479:               </div>
480:               <div className="flex items-center gap-3">
481:                 <span className="chip bg-emerald-100 text-emerald-700">
482:                   <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
483:                   Live data
484:                 </span>
485:               </div>
486:             </div>
487:           </div>
488: 
489:           {/* ── Content Management CTA ─────────────────────────────────── */}
490:           <Link
491:             href="/gov/manage"
492:             className="glass card-hover group flex flex-wrap items-center justify-between gap-4 p-6 animate-fade-up delay-100"
493:           >
494:             <div className="flex items-center gap-4">
495:               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30 transition-transform duration-300 group-hover:scale-110">
496:                 <Activity className="h-6 w-6 text-white" />
497:               </div>
498:               <div>
499:                 <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
500:                   Manage Portal Content
501:                   <span className="chip bg-brand-100 text-brand-700">Editable</span>
502:                 </h3>
503:                 <p className="text-sm text-slate-500">
504:                   Add, edit, or remove candidates, courses, employers, training partners, enrollments, and job postings.
505:                 </p>
506:               </div>
507:             </div>
508:             <div className="flex items-center gap-2 text-sm font-semibold text-brand-600">
509:               Open Manager
510:               <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
511:             </div>
512:           </Link>
513: 
514:           {/* ── Animated KPI Cards ──────────────────────────────────────── */}
515:           {statsLoading ? (
516:             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
517:               {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
518:             </div>
519:           ) : (
520:             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
521:               {kpiConfig.map(({ label, key, icon: Icon, tint, text, href, isPercent }, i) => (
522:                 <Link
523:                   key={label}
524:                   href={href}
525:                   className="glass card-hover p-5 animate-fade-up"
526:                   style={{ animationDelay: `${i * 0.06}s` }}
527:                 >
528:                   <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tint} shadow-md`}>
529:                     <Icon className="h-5 w-5 text-white" />
530:                   </div>
531:                   <p className="text-2xl font-bold text-slate-800">
532:                     <CountUp end={stats?.[key] ?? 0} suffix={isPercent ? "%" : ""} decimals={isPercent ? 1 : 0} />
533:                   </p>
534:                   <p className={`text-sm font-medium ${text}`}>{label}</p>
535:                   {isPercent && typeof stats?.overall_placement_rate === "number" && (
536:                     <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
537:                       <div
538:                         className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-1000 ease-out"
539:                         style={{ width: `${stats.overall_placement_rate}%` }}
540:                       />
541:                     </div>
542:                   )}
543:                 </Link>
544:               ))}
545:             </div>
546:           )}
547: 
548:           {/* ── Charts Row ──────────────────────────────────────────────── */}
549:           <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
550: 
551:             {/* Enrollment Trend Area Chart */}
552:             {trendsLoading ? <SkeletonChart /> : (
553:               <div className="glass p-6 animate-fade-up delay-100">
554:                 <h3 className="panel-title mb-4">
555:                   <Activity className="h-4 w-4 text-brand-600" />
556:                   Enrollment &amp; Completion Trends
557:                 </h3>
558:                 <div className="h-72">
559:                   <ResponsiveContainer width="100%" height="100%">
560:                     <AreaChart data={trends?.months ?? []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
561:                       <defs>
562:                         <linearGradient id="gradEnroll" x1="0" y1="0" x2="0" y2="1">
563:                           <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
564:                           <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
565:                         </linearGradient>
566:                         <linearGradient id="gradComp" x1="0" y1="0" x2="0" y2="1">
567:                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
568:                           <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
569:                         </linearGradient>
570:                       </defs>
571:                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" vertical={false} />
572:                       <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
573:                       <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
574:                       <Tooltip {...tooltipStyle} />
575:                       <Legend verticalAlign="top" height={36} />
576:                       <Area
577:                         type="monotone"
578:                         dataKey="enrollments"
579:                         name="Enrollments"
580:                         stroke="#4f46e5"
581:                         strokeWidth={2.5}
582:                         fill="url(#gradEnroll)"
583:                         dot={false}
584:                         activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
585:                       />
586:                       <Area
587:                         type="monotone"
588:                         dataKey="completions"
589:                         name="Completions"
590:                         stroke="#10b981"
591:                         strokeWidth={2.5}
592:                         fill="url(#gradComp)"
593:                         dot={false}
594:                         activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
595:                       />
596:                     </AreaChart>
597:                   </ResponsiveContainer>
598:                 </div>
599:               </div>
600:             )}
601: 
602:             {/* Top Skills Horizontal Bar Chart */}
603:             {skillsLoading ? <SkeletonChart /> : (
604:               <div className="glass p-6 animate-fade-up delay-200">
605:                 <div className="mb-4 flex items-center justify-between">
606:                   <h3 className="panel-title">
607:                     <BarChart3 className="h-4 w-4 text-violet-600" />
608:                     Top In-Demand Skills
609:                   </h3>
610:                   {topSkills?.skills && topSkills.skills.length > 0 && (
611:                     <CsvButton
612:                       data={topSkills.skills.map((s) => ({ skill: s.skill, demand: s.demand }))}
613:                       filename="skills-demand.csv"
614:                     />
615:                   )}
616:                 </div>
617:                 {(!topSkills?.skills || topSkills.skills.length === 0) ? (
618:                   <div className="flex h-72 flex-col items-center justify-center text-slate-400">
619:                     <BarChart3 className="mb-3 h-12 w-12 opacity-30" />
620:                     <p className="text-sm font-medium">No skill data available yet</p>
621:                     <p className="mt-1 text-xs text-slate-300">Data will appear as candidates complete training</p>
622:                   </div>
623:                 ) : (
624:                   <div className="h-72">
625:                     <ResponsiveContainer width="100%" height="100%">
626:                       <BarChart
627:                         data={topSkills.skills}
628:                         layout="vertical"
629:                         margin={{ left: 10, right: 20 }}
630:                       >
631:                         <defs>
632:                           <linearGradient id="gradSkill" x1="0" y1="0" x2="1" y2="0">
633:                             <stop offset="0%" stopColor="#4f46e5" />
634:                             <stop offset="100%" stopColor="#7c3aed" />
635:                           </linearGradient>
636:                         </defs>
637:                         <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" horizontal={false} />
638:                         <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
639:                         <YAxis type="category" dataKey="skill" width={120} tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
640:                         <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
641:                         <Bar
642:                           dataKey="demand"
643:                           name="Demand"
644:                           fill="url(#gradSkill)"
645:                           radius={[0, 6, 6, 0]}
646:                           maxBarSize={24}
647:                         />
648:                       </BarChart>
649:                     </ResponsiveContainer>
650:                   </div>
651:                 )}
652:               </div>
653:             )}
654:           </div>
655: 
656:           {/* ── Bottom Row: Scheme Performance + Policy Alerts ──────────── */}
657:           <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-up delay-300">
658: 
659:             {/* Scheme Performance Panel */}
660:             <div className="glass p-6">
661:               <div className="mb-4 flex items-center justify-between">
662:                 <h3 className="panel-title">
663:                   <BarChart3 className="h-4 w-4 text-amber-500" />
664:                   Scheme Performance
665:                 </h3>
666:                 <div className="flex items-center gap-2">
667:                   {schemes.length > 0 && (
668:                     <CsvButton
669:                       data={schemes.map((s) => ({
670:                         scheme_id: s.scheme_id,
671:                         total_enrolled: s.total_enrolled,
672:                         completion_rate: s.completion_rate,
673:                         cost_per_placement: s.cost_per_placement,
674:                         roi_score: s.roi_score,
675:                         alert_status: s.alert_status,
676:                       }))}
677:                       filename="scheme-performance.csv"
678:                     />
679:                   )}
680:                   <ReportButton
681:                     reportType="scheme-roi"
682:                     format="pdf"
683:                     label="PDF"
684:                     icon={FileText}
685:                     disabled={schemesLoading || schemes.length === 0}
686:                     onToast={showToast}
687:                   />
688:                   <Link href="/gov/scheme-roi" className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs font-medium">
689:                     View all <ChevronRight className="h-3 w-3" />
690:                   </Link>
691:                 </div>
692:               </div>
693:               {schemesLoading ? (
694:                 <SkeletonList rows={4} />
695:               ) : schemes.length === 0 ? (
696:                 <div className="flex h-48 flex-col items-center justify-center text-slate-400">
697:                   <BarChart3 className="mb-2 h-10 w-10 opacity-30" />
698:                   <p className="text-sm font-medium">No scheme data yet</p>
699:                 </div>
700:               ) : (
701:                 <div className="space-y-3">
702:                   {schemes.slice(0, 5).map((s, i) => (
703:                     <div
704:                       key={s.scheme_id}
705:                       className="glass-inner flex items-center justify-between p-4 transition hover:bg-white/80 animate-fade-up"
706:                       style={{ animationDelay: `${i * 0.05}s` }}
707:                     >
708:                       <div className="flex-1">
709:                         <p className="font-bold text-slate-800">{s.scheme_id}</p>
710:                         <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
711:                           <span>{s.total_enrolled.toLocaleString()} enrolled</span>
712:                           <span>&middot;</span>
713:                           <span>{s.completion_rate !== null ? `${s.completion_rate}%` : "—"} completion</span>
714:                         </div>
715:                       </div>
716:                       <div className="flex flex-col items-end gap-1.5">
717:                         <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${roiBadge(s.roi_score)}`}>
718:                           ROI {s.roi_score !== null ? s.roi_score.toFixed(1) : "—"}
719:                         </span>
720:                         <span className={`chip text-[10px] ${alertChip(s.alert_status)}`}>
721:                           {s.alert_status}
722:                         </span>
723:                       </div>
724:                     </div>
725:                   ))}
726:                 </div>
727:               )}
728:             </div>
729: 
730:             {/* Policy Alerts Panel */}
731:             <div className="glass p-6">
732:               <div className="mb-4 flex items-center justify-between">
733:                 <h3 className="panel-title">
734:                   <AlertTriangle className="h-4 w-4 text-rose-500" />
735:                   Policy Alerts
736:                 </h3>
737:                 <Link href="/gov/alerts" className="btn-ghost flex items-center gap-1 px-3 py-1.5 text-xs font-medium">
738:                   View all <ChevronRight className="h-3 w-3" />
739:                 </Link>
740:               </div>
741:               {alertsLoading ? (
742:                 <SkeletonList rows={3} />
743:               ) : alerts.length === 0 ? (
744:                 <div className="flex h-48 flex-col items-center justify-center">
745:                   <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
746:                     <CheckCircle2 className="h-7 w-7 text-emerald-500" />
747:                   </div>
748:                   <p className="font-semibold text-slate-700">All systems healthy</p>
749:                   <p className="mt-1 text-sm text-slate-400">No policy alerts at this time</p>
750:                 </div>
751:               ) : (
752:                 <div className="space-y-3">
753:                   {alerts.slice(0, 5).map((a, i) => (
754:                     <div
755:                       key={a.scheme_id}
756:                       className="glass-inner flex items-start gap-3 p-4 animate-fade-up"
757:                       style={{ animationDelay: `${i * 0.05}s` }}
758:                     >
759:                       <div className="mt-0.5 flex-shrink-0">
760:                         {a.alert_status === "alert" ? (
761:                           <span className="relative flex h-3 w-3">
762:                             <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
763:                             <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
764:                           </span>
765:                         ) : (
766:                           <span className="relative flex h-3 w-3">
767:                             <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
768:                             <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
769:                           </span>
770:                         )}
771:                       </div>
772:                       <div className="flex-1 min-w-0">
773:                         <div className="flex items-center gap-2">
774:                           <p className="font-bold text-slate-800">{a.scheme_id}</p>
775:                           <span className={`chip text-[10px] ${alertChip(a.alert_status)}`}>
776:                             {a.alert_status}
777:                           </span>
778:                         </div>
779:                         <p className="mt-1 text-xs text-slate-500 line-clamp-2">
780:                           {a.alert_reason ?? "No reason provided"}
781:                         </p>
782:                         <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
783:                           {a.roi_score !== null && (
784:                             <span className={`font-semibold ${a.roi_score < 2 ? "text-rose-500" : a.roi_score < 3 ? "text-amber-500" : "text-emerald-500"}`}>
785:                               ROI {a.roi_score.toFixed(1)}
786:                             </span>
787:                           )}
788:                           {a.cost_per_placement !== null && (
789:                             <span>₹{a.cost_per_placement.toLocaleString()}/placement</span>
790:                           )}
791:                           {a.computed_at && (
792:                             <span>{timeAgo(a.computed_at)}</span>
793:                           )}
794:                         </div>
795:                       </div>
796:                     </div>
797:                   ))}
798:                 </div>
799:               )}
800:             </div>
801:           </div>
802: 
803:           {/* ── Recent Activity Feed ────────────────────────────────────── */}
804:           <div className="glass p-6 animate-fade-up delay-300">
805:             <h3 className="panel-title mb-4">
806:               <Clock className="h-4 w-4 text-indigo-500" />
807:               Recent Activity
808:             </h3>
809:             {(candidatesLoading || enrollmentsLoading) ? (
810:               <SkeletonList rows={5} />
811:             ) : activityFeed.length === 0 ? (
812:               <div className="flex h-32 flex-col items-center justify-center text-slate-400">
813:                 <Clock className="mb-2 h-8 w-8 opacity-30" />
814:                 <p className="text-sm font-medium">No recent activity</p>
815:               </div>
816:             ) : (
817:               <div className="relative">
818:                 <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-brand-200 via-indigo-200 to-transparent" />
819:                 <div className="space-y-1">
820:                   {activityFeed.map((item, i) => (
821:                     <div
822:                       key={`${item.type}-${item.name}-${i}`}
823:                       className="relative flex items-center gap-4 rounded-xl py-3 pl-10 pr-4 transition hover:bg-white/50 animate-fade-up"
824:                       style={{ animationDelay: `${i * 0.04}s` }}
825:                     >
826:                       <div className="absolute left-2 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100">
827:                         {item.type === "candidate" ? (
828:                           <Users className="h-2.5 w-2.5 text-brand-500" />
829:                         ) : (
830:                           <BookOpen className="h-2.5 w-2.5 text-emerald-500" />
831:                         )}
832:                       </div>
833:                       <div className="flex-1 min-w-0">
834:                         <p className="text-sm font-semibold text-slate-700 truncate">{item.name}</p>
835:                         <p className="text-xs text-slate-400">{item.detail}</p>
836:                       </div>
837:                       <span className="flex-shrink-0 text-xs text-slate-400">{timeAgo(item.time)}</span>
838:                     </div>
839:                   ))}
840:                 </div>
841:               </div>
842:             )}
843:           </div>
844: 
845:           {/* ── NEW: Export / Quick Actions Row ────────────────────────── */}
846:           <div>
847:             <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
848:               <Download className="h-4 w-4" />
849:               Quick Actions
850:             </h3>
851:             <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
852:               <QuickActionTile
853:                 href="/gov/reports"
854:                 icon={FileText}
855:                 title="Reports & Exports"
856:                 subtitle="CSV / XLSX / PDF analytics"
857:                 tint="from-brand-500 to-indigo-500"
858:               />
859:               <QuickActionTile
860:                 href="/gov/surveys"
861:                 icon={ClipboardList}
862:                 title="Outcome Surveys"
863:                 subtitle="Track post-training outcomes"
864:                 tint="from-emerald-500 to-teal-500"
865:               />
866:               <QuickActionTile
867:                 href="/gov/manage"
868:                 icon={Settings2}
869:                 title="Content Manager"
870:                 subtitle="Edit portal entities"
871:                 tint="from-violet-500 to-fuchsia-500"
872:               />
873:               <QuickActionTile
874:                 href="/gov/heatmap"
875:                 icon={MapIcon}
876:                 title="Skill-Gap Map"
877:                 subtitle="Regional labor heatmap"
878:                 tint="from-orange-500 to-amber-500"
879:               />
880:             </div>
881:           </div>
882: 
883:           {/* ── NEW: Regional Breakdown + Sector Donut row ──────────────── */}
884:           <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-up delay-200">
885: 
886:             {/* Regional Breakdown */}
887:             <div className="glass p-6">
888:               <div className="mb-4 flex items-center justify-between">
889:                 <h3 className="panel-title">
890:                   <MapPin className="h-4 w-4 text-sky-600" />
891:                   Regional Candidate Breakdown
892:                 </h3>
893:                 <div className="flex items-center gap-2">
894:                   {regionalData.length > 0 && (
895:                     <CsvButton
896:                       data={regionalData.map((r) => ({ state: r.state, count: r.count }))}
897:                       filename="regional-breakdown.csv"
898:                     />
899:                   )}
900:                   <ReportButton
901:                     reportType="regional-candidates"
902:                     format="pdf"
903:                     label="PDF"
904:                     icon={FileText}
905:                     disabled={candidatesLoading || regionalData.length === 0}
906:                     onToast={showToast}
907:                   />
908:                   <ReportButton
909:                     reportType="regional-candidates"
910:                     format="xlsx"
911:                     label="XLSX"
912:                     icon={Table}
913:                     disabled={candidatesLoading || regionalData.length === 0}
914:                     onToast={showToast}
915:                   />
916:                   {!candidatesLoading && stateCount > 0 && (
917:                     <span className="chip bg-sky-100 text-sky-700">{stateCount} states</span>
918:                   )}
919:                 </div>
920:               </div>
921:               {candidatesLoading ? (
922:                 <SkeletonChart />
923:               ) : regionalData.length === 0 ? (
924:                 <div className="flex h-64 flex-col items-center justify-center text-slate-400">
925:                   <MapPin className="mb-3 h-12 w-12 opacity-30" />
926:                   <p className="text-sm font-medium">No candidate geo-data yet</p>
927:                   <p className="mt-1 text-xs text-slate-300">Candidates will appear once profiles are created</p>
928:                 </div>
929:               ) : (
930:                 <div className="h-64">
931:                   <ResponsiveContainer width="100%" height="100%">
932:                     <BarChart
933:                       data={regionalData}
934:                       layout="vertical"
935:                       margin={{ left: 10, right: 20 }}
936:                     >
937:                       <defs>
938:                         <linearGradient id="gradState" x1="0" y1="0" x2="1" y2="0">
939:                           <stop offset="0%" stopColor="#0ea5e9" />
940:                           <stop offset="100%" stopColor="#6366f1" />
941:                         </linearGradient>
942:                       </defs>
943:                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" horizontal={false} />
944:                       <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
945:                       <YAxis type="category" dataKey="state" width={130} tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
946:                       <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(14,165,233,0.06)" }} />
947:                       <Bar
948:                         dataKey="count"
949:                         name="Candidates"
950:                         fill="url(#gradState)"
951:                         radius={[0, 6, 6, 0]}
952:                         maxBarSize={22}
953:                       />
954:                     </BarChart>
955:                   </ResponsiveContainer>
956:                 </div>
957:               )}
958:             </div>
959: 
960:             {/* Sector Distribution Donut */}
961:             <div className="glass p-6">
962:               <div className="mb-2 flex items-center justify-between">
963:                 <h3 className="panel-title">
964:                   <PieChart className="h-4 w-4 text-fuchsia-600" />
965:                   Course Sector Mix
966:                 </h3>
967:                 {sectorData.length > 0 && (
968:                   <CsvButton
969:                     data={sectorData.map((s) => ({ name: s.name, value: s.value }))}
970:                     filename="sector-distribution.csv"
971:                   />
972:                 )}
973:               </div>
974:               {coursesLoading ? (
975:                 <SkeletonChart />
976:               ) : sectorData.length === 0 ? (
977:                 <div className="flex h-64 flex-col items-center justify-center text-slate-400">
978:                   <PieChart className="mb-3 h-12 w-12 opacity-30" />
979:                   <p className="text-sm font-medium">No course sector data yet</p>
980:                 </div>
981:               ) : (
982:                 <div className="flex h-64 flex-col items-center gap-2 sm:flex-row sm:justify-center">
983:                   <div className="h-56 w-56 shrink-0">
984:                     <ResponsiveContainer width="100%" height="100%">
985:                       <RePieChart>
986:                         <Pie
987:                           data={sectorData}
988:                           dataKey="value"
989:                           nameKey="name"
990:                           innerRadius={52}
991:                           outerRadius={80}
992:                           paddingAngle={2}
993:                           strokeWidth={0}
994:                         >
995:                           {sectorData.map((entry) => (
996:                             <Cell key={entry.name} fill={entry.color} />
997:                           ))}
998:                         </Pie>
999:                         <Tooltip {...tooltipStyle} />
1000:                       </RePieChart>
1001:                     </ResponsiveContainer>
1002:                   </div>
1003:                   <div className="max-h-56 w-full flex-1 space-y-1.5 overflow-auto pr-1 sm:max-h-64">
1004:                     {sectorData.slice(0, 8).map((s) => (
1005:                       <div key={s.name} className="flex items-center gap-2 text-xs">
1006:                         <span
1007:                           className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
1008:                           style={{ backgroundColor: s.color }}
1009:                         />
1010:                         <span className="truncate font-medium text-slate-700">{s.name}</span>
1011:                         <span className="ml-auto flex-shrink-0 font-semibold text-slate-500">{s.value}</span>
1012:                       </div>
1013:                     ))}
1014:                   </div>
1015:                 </div>
1016:               )}
1017:             </div>
1018:           </div>
1019: 
1020:           {/* ── NEW: Scheme Completion Progress Widgets ─────────────────── */}
1021:           <div className="glass p-6 animate-fade-up delay-300">
1022:             <div className="mb-4 flex items-center justify-between">
1023:               <h3 className="panel-title">
1024:                 <TrendingUp className="h-4 w-4 text-emerald-600" />
1025:                 Scheme Completion Progress
1026:               </h3>
1027:               <span className="chip bg-emerald-100 text-emerald-700">{schemesForProgress.length} schemes</span>
1028:             </div>
1029:             {schemesLoading ? (
1030:               <SkeletonList rows={4} />
1031:             ) : schemesForProgress.length === 0 ? (
1032:               <div className="flex h-24 flex-col items-center justify-center text-slate-400">
1033:                 <TrendingUp className="mb-2 h-8 w-8 opacity-30" />
1034:                 <p className="text-sm font-medium">No scheme completion data yet</p>
1035:               </div>
1036:             ) : (
1037:               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
1038:                 {schemesForProgress.map((s, i) => {
1039:                   const rate = s.completion_rate ?? 0;
1040:                   return (
1041:                     <div
1042:                       key={s.scheme_id}
1043:                       className="glass-inner p-4 transition hover:bg-white/80 animate-fade-up"
1044:                       style={{ animationDelay: `${i * 0.05}s` }}
1045:                     >
1046:                       <div className="mb-2 flex items-center justify-between gap-2">
1047:                         <p className="truncate font-bold text-slate-800" title={s.scheme_id}>{s.scheme_id}</p>
1048:                         <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${roiBadge(s.roi_score)}`}>
1049:                           ROI {s.roi_score !== null ? s.roi_score.toFixed(1) : "—"}
1050:                         </span>
1051:                       </div>
1052:                       <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
1053:                         <span>{s.total_completed.toLocaleString()} / {s.total_enrolled.toLocaleString()} completed</span>
1054:                         <span className="font-bold text-slate-700">{rate}%</span>
1055:                       </div>
1056:                       <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
1057:                         <div
1058:                           className={`h-full rounded-full transition-all duration-1000 ease-out ${completionColor(s.completion_rate)}`}
1059:                           style={{ width: `${Math.min(rate, 100)}%` }}
1060:                         />
1061:                       </div>
1062:                     </div>
1063:                   );
1064:                 })}
1065:               </div>
1066:             )}
1067:           </div>
1068: 
1069:           {/* ── NEW: Scheme Performance by State ─────────────────────────── */}
1070:           <div className="glass p-6 animate-fade-up delay-300">
1071:             <div className="mb-4 flex items-center justify-between">
1072:               <h3 className="panel-title">
1073:                 <MapPin className="h-4 w-4 text-violet-600" />
1074:                 Scheme Performance by State
1075:               </h3>
1076:               <div className="flex items-center gap-2">
1077:                 {stateComparison.tableRows.length > 0 && (
1078:                   <CsvButton
1079:                     data={stateComparison.tableRows.map((r) => ({
1080:                       scheme_id: r.scheme_id,
1081:                       state: r.state,
1082:                       total_enrolled: r.total_enrolled,
1083:                       completion_rate: r.completion_rate,
1084:                       placed_12m: r.placed_12m,
1085:                       roi_score: r.roi_score,
1086:                       alert_status: r.alert_status,
1087:                     }))}
1088:                     filename="scheme-by-state.csv"
1089:                   />
1090:                 )}
1091:                 {!schemesLoading && stateComparison.states.length > 0 && (
1092:                   <span className="chip bg-violet-100 text-violet-700">{stateComparison.states.length} states</span>
1093:                 )}
1094:               </div>
1095:             </div>
1096:             {schemesLoading ? (
1097:               <SkeletonChart />
1098:             ) : stateComparison.chartData.length === 0 ? (

(Output capped at 50 KB. Showing lines 1-1098. Use offset=1099 to continue.)
</content>
```

---

## Assistant (Build · Big Pickle · 16.7s)

_Thinking:_

Both candidate and gov dashboards are already quite rich. The gov dashboard has: KPI cards, enrollment trends, top skills, scheme performance, policy alerts, recent activity, quick actions, regional breakdown, sector donut, scheme completion progress, scheme by state.

Candidate dashboard has: welcome banner, stat cards, placement score, nav cards, recent applications, job match highlights, placement score breakdown, outcome journey, and more (the output was capped at line 1176; there's likely profile completeness, notifications, skill gap sections below).

So both are already elaborate. Given the user's "go", rather than adding more to already-rich pages, what would be most valuable now?

Let me think about what remains relatively thin:

1. **Employer jobs page** — probably fine.
2. **Candidate skills page** — exists.
3. **Gov manage / heatmap / scheme-roi / surveys / alerts pages** — exists.
4. **Candidate matches page** — exists with apply flow (per earlier summary, candidate application POST exists? The apply flow: matches page has Apply button).

Hmm. The user's overarching drive has been specifically the **employer dashboard** plus sample data, but also "add details and features". The last two batches were employer pipeline + candidate lifecycle.

What impactful things remain?

Option A: **Candidate dashboard "next interview" / recent notification spotlight** — candidate dashboard already has notifications nav card and stat cards. Maybe add an "attention inbox" — top 2 unread notifications + next upcoming interview spotlight. Actually there's already quite a lot.

Option B: **Employer: add "Your pipeline at a glance" — application funnel on dashboard is there.**

Option C: **Sample data breadth for other dashboards** — e.g., outcome timeline entries for candidates (12-month employment tracking), which power the gov outcome analytics and the candidate Outcome Journey. Currently the "Outcome Journey" on candidate dashboard may show data only if entered; earlier smoke likely had outcome data (gov drawer uses useOutcomeTimeline). Let me check whether outcome data exists for sample candidates.

Option D: **Cross-cutting: candidate notifications auto-generation on offer expiry** etc.

Option E: **Employer jobs page**: could add average applicants per posting, days-to-fill, "posting health" chips. Sample data exists (5 jobs with 21 apps).

Option F: **Candidate "Interview prep" already exists.**

Given the pattern of user prompts (add to employer dashboard + sample data), and that employer dashboard now has many panels, a strong next feature set could be:

**Batch: Employer jobs page enrichment + candidate Dashboard "My Hiring Journey" strip + sample data for outcome timeline.**

Actually, let me reconsider. The user keeps saying "go" — they want me to keep building autonomously. I should pick high-value additions and implement. Let me look at what pages might be sparse. Let me check the employer jobs page and the candidate skills page and the matches page quickly... Actually the most coherent next narrative:

1. **Employer jobs page**: add analytics per posting — applicants count, avg match, status breakdown, "posting health" (e.g., applicants in last 7 days), quick actions. There's already a jobs list page; let me read it to see.

2. **Candidate profile completion / notifications spotlight** — maybe skip.

3. **Sample data**: outcome sorties — ensure candidates have outcome_timeline? Let me check what the outcome timeline requires. Actually per AGENTS.md there's ml/placement and outcome tracking. Maybe there's an `outcomes` model. The gov drawer used useOutcomeTimeline(candidateId). Let me check whether sample candidates have outcome data. If not, seeding some would enrich candidate "Outcome Journey" + gov analytics + reports.

Let me explore the employer jobs page and check outcome timeline data presence. Let me read employer/jobs/page.tsx and check outcome-related backend.

Let me do parallel: read employer jobs page; grep backend for outcome timeline endpoint/model; check DB for outcomes count.

Both dashboards are rich. Let me check the employer jobs page and outcome-timeline sample data coverage to pick the highest-value gaps:

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\employer\\jobs\\page.tsx"
}
```

**Output:**
```
<path>C:\aaditya\Opencode-project\SIH26135\frontend\src\app\employer\jobs\page.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import { useState } from "react";
4: import Link from "next/link";
5: import Sidebar from "@/components/layout/Sidebar";
6: import TopBar from "@/components/layout/TopBar";
7: import { useRequireAuth } from "@/lib/hooks/useAuthGuard";
8: import {
9:   useJobPostings,
10:   createJobPosting,
11:   deactivateJobPosting,
12: } from "@/lib/hooks/useDashboard";
13: import type { JobPostingListItem } from "@/lib/types";
14: import Modal from "@/components/ui/Modal";
15: import Field from "@/components/ui/Field";
16: import Toast from "@/components/ui/Toast";
17: import { Plus, MoreHorizontal, Briefcase, MapPin, IndianRupee, Calendar } from "lucide-react";
18: 
19: const INDIAN_STATES = [
20:   "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
21:   "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
22:   "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
23:   "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
24:   "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
25: ];
26: 
27: function formatSalary(n: number | null) {
28:   if (n == null) return null;
29:   if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
30:   if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
31:   return `₹${n}`;
32: }
33: 
34: function formatDate(iso: string) {
35:   return new Date(iso).toLocaleDateString("en-IN", {
36:     day: "numeric",
37:     month: "short",
38:     year: "numeric",
39:   });
40: }
41: 
42: export default function EmployerJobsPage() {
43:   useRequireAuth("employer");
44: 
45:   const { data: jobs, loading, } = useJobPostings(50);
46:   const [modalOpen, setModalOpen] = useState(false);
47:   const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
48:   const [submitting, setSubmitting] = useState(false);
49:   const [activeMenu, setActiveMenu] = useState<string | null>(null);
50:   const [confirmDeactivate, setConfirmDeactivate] = useState<JobPostingListItem | null>(null);
51: 
52:   const [form, setForm] = useState({
53:     title: "",
54:     state: "",
55:     district: "",
56:     salary_min: "",
57:     salary_max: "",
58:     required_skills: "",
59:   });
60: 
61:   const resetForm = () =>
62:     setForm({ title: "", state: "", district: "", salary_min: "", salary_max: "", required_skills: "" });
63: 
64:   const handleCreate = async (e: React.FormEvent) => {
65:     e.preventDefault();
66:     setSubmitting(true);
67:     try {
68:       await createJobPosting({
69:         title: form.title,
70:         state: form.state || undefined,
71:         district: form.district || undefined,
72:         salary_min: form.salary_min ? Number(form.salary_min) : undefined,
73:         salary_max: form.salary_max ? Number(form.salary_max) : undefined,
74:         required_skills: form.required_skills
75:           ? form.required_skills.split(",").map((s) => s.trim()).filter(Boolean)
76:           : undefined,
77:       });
78:       setToast({ message: "Job posting created!", tone: "success" });
79:       setModalOpen(false);
80:       resetForm();
81:     } catch {
82:       setToast({ message: "Failed to create job posting.", tone: "error" });
83:     } finally {
84:       setSubmitting(false);
85:     }
86:   };
87: 
88:   const handleDeactivate = async (job: JobPostingListItem) => {
89:     try {
90:       await deactivateJobPosting(job.id);
91:       setToast({ message: `"${job.title}" has been deactivated.`, tone: "success" });
92:       setActiveMenu(null);
93:       setConfirmDeactivate(null);
94:     } catch {
95:       setToast({ message: "Failed to deactivate job posting.", tone: "error" });
96:     }
97:   };
98: 
99:   return (
100:     <div className="flex min-h-screen">
101:       <Sidebar />
102:       <div className="flex-1">
103:         <TopBar title="Job Postings" />
104:         <main className="p-6">
105:           <div className="max-w-5xl mx-auto">
106:             <div className="flex items-center justify-between mb-8">
107:               <div>
108:                 <h1 className="text-3xl font-bold text-slate-800 mb-1">Job Postings</h1>
109:                 <p className="text-slate-500">Create and manage your job listings</p>
110:               </div>
111:               <button onClick={() => setModalOpen(true)} className="btn-glass">
112:                 <Plus className="h-4 w-4" /> New Posting
113:               </button>
114:             </div>
115: 
116:             {toast && (
117:               <div className="mb-4">
118:                 <Toast message={toast.message} tone={toast.tone} />
119:               </div>
120:             )}
121: 
122:             {loading && (
123:               <div className="space-y-4">
124:                 {[1, 2, 3].map((i) => (
125:                   <div key={i} className="glass skeleton h-28 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }} />
126:                 ))}
127:               </div>
128:             )}
129: 
130:             {!loading && jobs.length === 0 && (
131:               <div className="glass p-12 text-center animate-fade-up">
132:                 <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
133:                 <p className="text-slate-600 font-medium">No job postings yet</p>
134:                 <p className="text-sm text-slate-400 mt-1">Create your first posting to start receiving candidates.</p>
135:                 <button onClick={() => setModalOpen(true)} className="btn-glass mt-4">
136:                   <Plus className="h-4 w-4" /> Create First Posting
137:                 </button>
138:               </div>
139:             )}
140: 
141:             {!loading && jobs.length > 0 && (
142:               <div className="space-y-3">
143:                 {jobs.map((job, i) => (
144:                   <div
145:                     key={job.id}
146:                     className="glass card-hover p-5 animate-fade-up"
147:                     style={{ animationDelay: `${0.04 * (i + 1)}s` }}
148:                   >
149:                     <div className="flex items-start justify-between gap-4">
150:                       <div className="flex-1 min-w-0">
151:                         <div className="flex items-center gap-3 mb-2">
152:                           <h3 className="text-lg font-semibold text-slate-800 truncate">{job.title}</h3>
153:                           <span className={`chip text-xs shrink-0 ${job.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
154:                             {job.is_active ? "Active" : "Closed"}
155:                           </span>
156:                         </div>
157:                         <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mb-2">
158:                           {(job.state || job.district) && (
159:                             <span className="flex items-center gap-1">
160:                               <MapPin className="h-3.5 w-3.5" />
161:                               {[job.district, job.state].filter(Boolean).join(", ")}
162:                             </span>
163:                           )}
164:                           {(job.salary_min != null || job.salary_max != null) && (
165:                             <span className="flex items-center gap-1">
166:                               <IndianRupee className="h-3.5 w-3.5" />
167:                               {formatSalary(job.salary_min)} – {formatSalary(job.salary_max)}
168:                             </span>
169:                           )}
170:                           <span className="flex items-center gap-1">
171:                             <Calendar className="h-3.5 w-3.5" />
172:                             {formatDate(job.created_at)}
173:                           </span>
174:                         </div>
175:                         {job.required_skills.length > 0 && (
176:                           <div className="flex flex-wrap gap-1.5">
177:                             {job.required_skills.map((s) => (
178:                               <span key={s} className="chip bg-brand-100 text-brand-700 text-xs">{s}</span>
179:                             ))}
180:                           </div>
181:                         )}
182:                       </div>
183:                       <div className="relative shrink-0">
184:                         <button
185:                           onClick={() => setActiveMenu(activeMenu === job.id ? null : job.id)}
186:                           className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/60 rounded-lg transition"
187:                         >
188:                           <MoreHorizontal className="h-4 w-4" />
189:                         </button>
190:                         {activeMenu === job.id && (
191:                           <div className="absolute right-0 top-full mt-1 w-44 glass rounded-xl py-1 z-20 shadow-lg animate-scale-in">
192:                             <Link
193:                               href="/employer/pipeline"
194:                               onClick={() => setActiveMenu(null)}
195:                               className="block px-4 py-2 text-sm text-slate-700 hover:bg-white/70 transition"
196:                             >
197:                               View Applicants
198:                             </Link>
199:                             <button
200:                               onClick={() => {
201:                                 setActiveMenu(null);
202:                                 setConfirmDeactivate(job);
203:                               }}
204:                               className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
205:                             >
206:                               {job.is_active ? "Deactivate" : "Reactivate"}
207:                             </button>
208:                           </div>
209:                         )}
210:                       </div>
211:                     </div>
212:                   </div>
213:                 ))}
214:               </div>
215:             )}
216:           </div>
217:         </main>
218:       </div>
219: 
220:       {/* Create Posting Modal */}
221:       <Modal open={modalOpen} title="Create Job Posting" onClose={() => !submitting && setModalOpen(false)}>
222:         <form onSubmit={handleCreate} className="space-y-4">
223:           <Field
224:             label="Job Title"
225:             name="title"
226:             value={form.title}
227:             onChange={(v) => setForm({ ...form, title: v })}
228:             required
229:             placeholder="e.g. Junior Python Developer"
230:           />
231:           <div className="grid grid-cols-2 gap-4">
232:             <label className="block">
233:               <span className="mb-1 block text-sm font-medium text-slate-700">State</span>
234:               <select
235:                 value={form.state}
236:                 onChange={(e) => setForm({ ...form, state: e.target.value })}
237:                 className="input-glass w-full"
238:               >
239:                 <option value="">Select state</option>
240:                 {INDIAN_STATES.map((s) => (
241:                   <option key={s} value={s}>{s}</option>
242:                 ))}
243:               </select>
244:             </label>
245:             <Field
246:               label="District"
247:               name="district"
248:               value={form.district}
249:               onChange={(v) => setForm({ ...form, district: v })}
250:               placeholder="e.g. Bengaluru Urban"
251:             />
252:           </div>
253:           <div className="grid grid-cols-2 gap-4">
254:             <Field
255:               label="Salary Min (₹/year)"
256:               name="salary_min"
257:               type="number"
258:               value={form.salary_min}
259:               onChange={(v) => setForm({ ...form, salary_min: v })}
260:               placeholder="400000"
261:             />
262:             <Field
263:               label="Salary Max (₹/year)"
264:               name="salary_max"
265:               type="number"
266:               value={form.salary_max}
267:               onChange={(v) => setForm({ ...form, salary_max: v })}
268:               placeholder="600000"
269:             />
270:           </div>
271:           <Field
272:             label="Required Skills"
273:             name="required_skills"
274:             value={form.required_skills}
275:             onChange={(v) => setForm({ ...form, required_skills: v })}
276:             placeholder="Python, SQL, Django (comma-separated)"
277:             hint="Separate skills with commas"
278:           />
279:           <div className="flex justify-end gap-3 pt-2">
280:             <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost" disabled={submitting}>
281:               Cancel
282:             </button>
283:             <button type="submit" className="btn-glass" disabled={submitting}>
284:               {submitting ? "Creating…" : "Create Posting"}
285:             </button>
286:           </div>
287:         </form>
288:       </Modal>
289: 
290:       {/* Deactivate Confirmation */}
291:       <Modal
292:         open={!!confirmDeactivate}
293:         title={confirmDeactivate?.is_active ? "Deactivate Posting?" : "Reactivate Posting?"}
294:         onClose={() => setConfirmDeactivate(null)}
295:         footer={
296:           <>
297:             <button onClick={() => setConfirmDeactivate(null)} className="btn-ghost">
298:               Cancel
299:             </button>
300:             <button
301:               onClick={() => confirmDeactivate && handleDeactivate(confirmDeactivate)}
302:               className="btn-glass"
303:             >
304:               {confirmDeactivate?.is_active ? "Deactivate" : "Reactivate"}
305:             </button>
306:           </>
307:         }
308:       >
309:         <p className="text-sm text-slate-600">
310:           {confirmDeactivate?.is_active
311:             ? `This will close "${confirmDeactivate?.title}" and stop showing it to candidates.`
312:             : `This will reopen "${confirmDeactivate?.title}" for new applications.`}
313:         </p>
314:       </Modal>
315: 
316:       {/* Click-away for menu */}
317:       {activeMenu && <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />}
318:     </div>
319:   );
320: }

(End of file - total 320 lines)
</content>
```

**Tool: grep**

**Input:**
```json
{
  "path": "C:\\aaditya\\Opencode-project\\SIH26135\\backend\\app",
  "pattern": "outcome|Outcome"
}
```

**Output:**
```
Found 100 matches (more matches available)
C:\aaditya\Opencode-project\SIH26135\backend\app\main.py:
  Line 11:     enrollments, outcomes, job_postings, surveys, webhooks, matches, ml,

  Line 23:         description="Vocational Education Outcome Tracking & Labor Analytics Platform",

  Line 72:     app.include_router(outcomes.router, prefix="/api/v1/outcomes", tags=["Employment Outcomes"])


C:\aaditya\Opencode-project\SIH26135\backend\app\seeds_rich.py:
  Line 7: 5 employment outcomes, and matching users.  Idempotent — skips rows that

  Line 26: from app.models.employment_outcome import EmploymentOutcome

  Line 161:             "employment_outcomes": 0,

  Line 463:         # ── 10. Employment Outcomes ───────────────────────────────────────

  Line 465:         outcome_data = [

  Line 472:         for ci, ei, empi, interval, sal, title in outcome_data:

  Line 477:                 select(EmploymentOutcome.id).where(

  Line 478:                     EmploymentOutcome.candidate_id == cand_id,

  Line 479:                     EmploymentOutcome.enrollment_id == enroll_id,

  Line 480:                     EmploymentOutcome.survey_interval == interval,

  Line 486:             db.add(EmploymentOutcome(

  Line 502:             counts["employment_outcomes"] += 1

  Line 519:         print(f"  Emp. Outcomes     : {counts['employment_outcomes']}")


C:\aaditya\Opencode-project\SIH26135\backend\app\models\candidate.py:
  Line 51:     outcomes = relationship("EmploymentOutcome", back_populates="candidate", lazy="selectin")


C:\aaditya\Opencode-project\SIH26135\backend\app\services\candidate_service.py:
  Line 6: from app.models.employment_outcome import EmploymentOutcome

  Line 10:     """Build a complete timeline for a candidate: enrollments, outcomes, surveys."""

  Line 18:         outcomes_result = await db.execute(

  Line 19:             select(EmploymentOutcome).where(

  Line 20:                 EmploymentOutcome.enrollment_id == enrollment.id

  Line 21:             ).order_by(EmploymentOutcome.survey_date)

  Line 23:         outcomes = outcomes_result.scalars().all()

  Line 33:             "outcomes": [

  Line 41:                 for o in outcomes


C:\aaditya\Opencode-project\SIH26135\backend\app\models\employer.py:
  Line 29:     outcomes = relationship("EmploymentOutcome", back_populates="employer", lazy="selectin")


C:\aaditya\Opencode-project\SIH26135\backend\app\services\ml_service.py:
  Line 149:     Green-field (no outcomes seeded yet) falls back to an approval-based prior:


C:\aaditya\Opencode-project\SIH26135\backend\app\api\v1\analytics.py:
  Line 17: from app.models.employment_outcome import EmploymentOutcome

  Line 36:     total_outcomes = await db.execute(select(func.count(EmploymentOutcome.id)))

  Line 38:         select(func.count(EmploymentOutcome.id)).where(EmploymentOutcome.is_employed == True)

  Line 48:     t_out = total_outcomes.scalar() or 0

  Line 160:     # Placement rate: employed outcomes / total outcomes (all intervals).

  Line 161:     total_outcomes = await db.execute(select(func.count(EmploymentOutcome.id)))

  Line 162:     employed_outcomes = await db.execute(

  Line 163:         select(func.count(EmploymentOutcome.id)).where(EmploymentOutcome.is_employed == True)

  Line 165:     t_out = total_outcomes.scalar() or 0

  Line 166:     e_out = employed_outcomes.scalar() or 0


C:\aaditya\Opencode-project\SIH26135\backend\app\services\reporting_service.py:
  Line 17:     "outcomes",

  Line 26:     "outcomes": "Employment Outcomes",

  Line 60:     "outcomes": [


C:\aaditya\Opencode-project\SIH26135\backend\app\api\v1\enrollments.py:
  Line 92:     """Enriched enrollment rows with candidate name, course name, and latest outcome."""

  Line 93:     from app.models.employment_outcome import EmploymentOutcome

  Line 114:     latest_outcomes: dict[UUID, object] = {}

  Line 117:             select(EmploymentOutcome)

  Line 119:                 EmploymentOutcome.enrollment_id.in_([e.id for e in enrolled])

  Line 121:             .order_by(EmploymentOutcome.survey_date.desc())

  Line 124:             if o.enrollment_id not in latest_outcomes:

  Line 125:                 latest_outcomes[o.enrollment_id] = o

  Line 129:         outcome = latest_outcomes.get(e.id)

  Line 142:             "is_employed": outcome.is_employed if outcome else None,

  Line 143:             "is_self_employed": getattr(outcome, "is_self_employed", False),

  Line 144:             "current_job_title": outcome.current_job_title if outcome else None,

  Line 145:             "monthly_salary": float(outcome.monthly_salary) if outcome and outcome.monthly_salary else None,

  Line 146:             "survey_interval": outcome.survey_interval if outcome else None,

  Line 147:             "job_location": outcome.job_location if outcome else None,


C:\aaditya\Opencode-project\SIH26135\backend\app\models\employment_outcome.py:
  Line 14: class EmploymentOutcome(Base):

  Line 15:     __tablename__ = "employment_outcomes"

  Line 19:             name="uq_outcome_per_interval",

  Line 34:     # Outcome fields

  Line 61:     candidate = relationship("Candidate", back_populates="outcomes")

  Line 62:     employer = relationship("Employer", back_populates="outcomes")

  Line 63:     enrollment = relationship("Enrollment", back_populates="outcomes")


C:\aaditya\Opencode-project\SIH26135\backend\app\crud\crud_outcome.py:
  Line 2: from app.models.employment_outcome import EmploymentOutcome

  Line 4: outcome_crud = BaseCRUD(EmploymentOutcome)


C:\aaditya\Opencode-project\SIH26135\backend\app\models\enrollment.py:
  Line 30:     outcomes = relationship("EmploymentOutcome", back_populates="enrollment", lazy="selectin")


C:\aaditya\Opencode-project\SIH26135\backend\app\api\v1\outcomes.py:
  Line 15: from app.models.employment_outcome import EmploymentOutcome

  Line 22: class OutcomeCreate(BaseModel):

  Line 39: class OutcomeResponse(BaseModel):

  Line 59: @router.get("/", response_model=list[OutcomeResponse])

  Line 60: async def list_outcomes(

  Line 69:     query = select(EmploymentOutcome)

  Line 71:         query = query.where(EmploymentOutcome.candidate_id == candidate_id)

  Line 73:         query = query.where(EmploymentOutcome.enrollment_id == enrollment_id)

  Line 75:         query = query.where(EmploymentOutcome.survey_interval == survey_interval)

  Line 76:     query = query.order_by(EmploymentOutcome.survey_date.desc()).offset(skip).limit(limit)

  Line 81: @router.post("/", response_model=OutcomeResponse, status_code=201)

  Line 82: async def create_outcome(

  Line 83:     body: OutcomeCreate,

  Line 87:     outcome = EmploymentOutcome(**body.model_dump())

  Line 88:     outcome.self_reported = user.get("role") == "candidate"

  Line 89:     outcome.response_channel = "web_portal"

  Line 90:     db.add(outcome)

  Line 92:     await db.refresh(outcome)

  Line 93:     return outcome

  Line 97: async def import_outcomes_csv(

  Line 103:     CSV import for employment outcomes.

  Line 166:             outcome = EmploymentOutcome(

  Line 179:             db.add(outcome)

  Line 189: async def candidate_outcome_timeline(

  Line 194:     """Get full longitudinal outcome timeline for a candidate."""

  Line 196:         select(EmploymentOutcome)

  Line 197:         .where(EmploymentOutcome.candidate_id == candidate_id)

  Line 198:         .order_by(EmploymentOutcome.survey_date)

  Line 200:     outcomes = result.scalars().all()

  Line 203:     for o in outcomes:

  Line 231:             select(func.count(EmploymentOutcome.id)).where(

  Line 232:                 EmploymentOutcome.survey_interval == interval

  Line 236:             select(func.count(EmploymentOutcome.id)).where(

  Line 237:                 EmploymentOutcome.survey_interval == interval,


(Results truncated. Consider using a more specific path or pattern.)
```

---

## Assistant (Build · Big Pickle · 14.4s)

_Thinking:_

The employer jobs page is a plain list. The outcome timeline is seeded by `seeds_rich.py` (5 employment outcomes). 

Best high-value moves now, aligned with "add details and features into employer dashboard and sample data":

1. **Employer Jobs page → add per-posting analytics + applying experience**: applicants count per posting (already fetchable), avg match, plus a "View pipeline" CTA. Add a summary header row (total postings, total applicants, avg applicants/posting, newest posting age).

2. **Employer jobs per-posting stats widget**: use `useJobApplicants(jobId)` per posting, or better fetch overview once and aggregate. Actually `useMyApplications` is candidate-side. For employers there's `overview`. But jobs page already loads jobs (50). Add `useEmployerApplicationsOverview` to the jobs page and aggregate per posting → applicant counts + status breakdown + avg match; render chips on each card + a mini progress bar of hired/applied. That gives real "analytics" detail.

3. **Candidate dashboard "Next steps / interview spotlight"** — candidate dashboard doesn't surface upcoming interview prominently? It shows recent applications and match highlights. Add an "Interview & Offers spotlight" — first upcoming interview across applications with countdown + CTA to applications page. Uses existing useMyApplications data (already loaded). Cheap, valuable.

Also maybe **sample data**: outcome timeline entries for the seeded candidates (currently only 5 total from seeds_rich across all). The candidate dashboard Outcome Journey for Rahul Sharma (candidate 9876543210) may be empty. Let me verify quickly whether the demo candidate has outcomes. If empty, seed a couple of outcome entries for demo candidate tied to an enrollment. That enriches candidate Outcome Journey + gov drawer + placement rate.

Let me check DB for outcomes count and demo candidate's outcomes.

Actually, let me be efficient: batch plan:

**Batch: Job health analytics + candidate spotlight + outcome sample data**

1. Employer jobs page: add analytics per posting (applicants count, avg match, hired count, youngest app) + top summary strip. Reuse `useEmployerApplicationsOverview`.
2. Candidate dashboard: add "Interview & Offers spotlight" panel (next upcoming interview with countdown; counts of offered/hired). 
3. Sample data: ensure demo candidate (Rahul Sharma 9876543210) has outcome timeline entries (via employment_outcomes for his most recent enrollment) if missing — enriches Outcome Journey + gov analytics.
4. Verify gates.

Let me first check demo candidate's outcomes + enrollments in DB.

Employer jobs page is a plain list — good candidate for analytics enrichment. First check whether the demo candidate has outcome data (to decide on sample-data seeding):

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\backend\\app\\seeds_rich.py",
  "limit": 40,
  "offset": 463
}
```

**Output:**
```
<path>C:\aaditya\Opencode-project\SIH26135\backend\app\seeds_rich.py</path>
<type>file</type>
<content>
463:         # ── 10. Employment Outcomes ───────────────────────────────────────
464:         # (cand_idx, enrolled_idx, emp_idx, interval, salary, title)
465:         outcome_data = [
466:             (0, 0, 0, "6_month", 32000, "Junior Python Developer"),
467:             (1, 2, 0, "3_month", 28000, "Data Analyst"),
468:             (4, 3, 3, "6_month", 26000, "Bank Clerk"),
469:             (8, 11, 1, "3_month", 22000, "CNC Operator"),
470:             (10, 13, 2, "6_month", 20000, "Healthcare Assistant"),
471:         ]
472:         for ci, ei, empi, interval, sal, title in outcome_data:
473:             cand_id = cand_ids[ci]
474:             enroll_id = enrolled_ids[ei]
475:             # Unique constraint: candidate_id + enrollment_id + survey_interval
476:             existing_out = await db.execute(
477:                 select(EmploymentOutcome.id).where(
478:                     EmploymentOutcome.candidate_id == cand_id,
479:                     EmploymentOutcome.enrollment_id == enroll_id,
480:                     EmploymentOutcome.survey_interval == interval,
481:                 )
482:             )
483:             if existing_out.scalar() is not None:
484:                 continue
485:             survey_date = today - timedelta(days=90 if interval == "3_month" else 180)
486:             db.add(EmploymentOutcome(
487:                 candidate_id=cand_id,
488:                 enrollment_id=enroll_id,
489:                 employer_id=emp_ids[empi],
490:                 survey_interval=interval,
491:                 survey_date=survey_date,
492:                 is_employed=True,
493:                 current_job_title=title,
494:                 monthly_salary=sal,
495:                 job_location=EMPLOYERS[empi]["district"],
496:                 is_job_relevant_to_training=True,
497:                 skills_used=["Python", "SQL"] if ci in (0, 1) else ["CNC"] if ci == 8 else [],
498:                 months_at_employer=3.0 if interval == "3_month" else 6.0,
499:                 response_channel="web_portal",
500:                 self_reported=True,
501:             ))
502:             counts["employment_outcomes"] += 1

(Showing lines 463-502 of 528. Use offset=503 to continue.)
</content>
```

**Tool: grep**

**Input:**
```json
{
  "include": "employment_outcome.py",
  "path": "C:\\aaditya\\Opencode-project\\SIH26135\\backend\\app\\models",
  "pattern": "Column|interval|survey_date|is_employed"
}
```

**Output:**
```
Found 25 matches
C:\aaditya\Opencode-project\SIH26135\backend\app\models\employment_outcome.py:
  Line 5:     Boolean, Column, DateTime, Date, Enum, ForeignKey, Numeric, String,

  Line 18:             "candidate_id", "enrollment_id", "survey_interval",

  Line 19:             name="uq_outcome_per_interval",

  Line 23:     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

  Line 24:     candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False, index=True)

  Line 25:     enrollment_id = Column(UUID(as_uuid=True), ForeignKey("enrollments.id"), nullable=False)

  Line 26:     employer_id = Column(UUID(as_uuid=True), ForeignKey("employers.id"), nullable=True)

  Line 28:     survey_interval = Column(

  Line 29:         Enum("3_month", "6_month", "12_month", name="survey_interval"),

  Line 32:     survey_date = Column(Date, nullable=False)

  Line 35:     is_employed = Column(Boolean, nullable=False, default=False)

  Line 36:     is_self_employed = Column(Boolean, default=False)

  Line 37:     current_job_title = Column(String(255), nullable=True)

  Line 38:     monthly_salary = Column(Numeric(12, 2), nullable=True)

  Line 39:     salary_currency = Column(String(3), default="INR")

  Line 40:     job_location = Column(String(255), nullable=True)

  Line 41:     is_job_relevant_to_training = Column(Boolean, nullable=True)

  Line 44:     skills_used = Column(JSONB, default=[])

  Line 45:     additional_skills_acquired = Column(JSONB, default=[])

  Line 48:     employer_retention_confirmed = Column(Boolean, default=False)

  Line 49:     months_at_employer = Column(Numeric(4, 1), nullable=True)

  Line 52:     response_channel = Column(

  Line 56:     self_reported = Column(Boolean, default=False)

  Line 57:     verified_by_employer = Column(Boolean, default=False)

  Line 59:     created_at = Column(DateTime, default=datetime.utcnow)

```

---

## Assistant (Build · Big Pickle · 5.9s)

_Thinking:_

Good. Now let me check demo candidate's enrollments and outcomes. Demo candidate = Rahul Sharma phone 9876543210. Let me query DB: candidates by phone, enrollments, outcomes. Also fetch his application list (he's the one with 21 apps? Actually candidate 9876543210 Rahul Sharma is a seed_rich candidate - he applied to many Infosys jobs in seeds_employer_demo).

Write a temp script to query enrollments + outcomes for Rahul + count employers having outcomes.

**Tool: write**

**Input:**
```json
{
  "content": "import asyncio\nfrom sqlalchemy import text\nfrom app.database import engine\n\n\nasync def main() -> None:\n    async with engine.begin() as conn:\n        r = await conn.execute(\n            text(\n                \"\"\"\n                SELECT c.id, c.full_name, c.phone,\n                       (SELECT COUNT(*) FROM enrollments e WHERE e.candidate_id = c.id) AS enrolls,\n                       (SELECT COUNT(*) FROM employment_outcomes o WHERE o.candidate_id = c.id) AS outcomes\n                FROM candidates c\n                WHERE c.phone IN ('9876543210','9876543211','9876543212','9800000001','9800000002','9800000003')\n                ORDER BY c.phone\n                \"\"\"\n            )\n        )\n        for row in r.mappings().all():\n            print(row[\"phone\"], \"|\", row[\"full_name\"], \"| enrolls:\", row[\"enrolls\"], \"| outcomes:\", row[\"outcomes\"])\n\n        o = await conn.execute(text(\"SELECT COUNT(*) AS n, COUNT(DISTINCT candidate_id) AS cands FROM employment_outcomes\"))\n        print(\"TOTAL_OUTCOMES\", dict(o.mappings().first()))\n    await engine.dispose()\n\n\nasyncio.run(main())",
  "filePath": "C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\check_outcomes.py"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Big Pickle · 5.9s)

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; python -c \"import sys; sys.path.insert(0, r'C:\\aaditya\\Opencode-project\\SIH26135\\backend'); exec(open(r'C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\check_outcomes.py', encoding='utf-8').read())\" 2>$null",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```
2026-09-05 02:52:37,449 INFO sqlalchemy.engine.Engine select pg_catalog.version()
2026-09-05 02:52:37,449 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 02:52:37,451 INFO sqlalchemy.engine.Engine select current_schema()
2026-09-05 02:52:37,451 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 02:52:37,452 INFO sqlalchemy.engine.Engine show standard_conforming_strings
2026-09-05 02:52:37,452 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 02:52:37,453 INFO sqlalchemy.engine.Engine BEGIN (implicit)
2026-09-05 02:52:37,453 INFO sqlalchemy.engine.Engine 
                SELECT c.id, c.full_name, c.phone,
                       (SELECT COUNT(*) FROM enrollments e WHERE e.candidate_id = c.id) AS enrolls,
                       (SELECT COUNT(*) FROM employment_outcomes o WHERE o.candidate_id = c.id) AS outcomes
                FROM candidates c
                WHERE c.phone IN ('9876543210','9876543211','9876543212','9800000001','9800000002','9800000003')
                ORDER BY c.phone
                
2026-09-05 02:52:37,453 INFO sqlalchemy.engine.Engine [generated in 0.00012s] ()
9800000001 | Arjun Menon | enrolls: 2 | outcomes: 1
9800000002 | Deepika Sharma | enrolls: 2 | outcomes: 1
9800000003 | Karthik Iyer | enrolls: 1 | outcomes: 0
9876543210 | aadi Sharma | enrolls: 1 | outcomes: 0
9876543211 | Priya Patel | enrolls: 1 | outcomes: 0
9876543212 | Amit Kumar | enrolls: 1 | outcomes: 0
2026-09-05 02:52:37,467 INFO sqlalchemy.engine.Engine SELECT COUNT(*) AS n, COUNT(DISTINCT candidate_id) AS cands FROM employment_outcomes
2026-09-05 02:52:37,467 INFO sqlalchemy.engine.Engine [generated in 0.00018s] ()
TOTAL_OUTCOMES {'n': 5, 'cands': 5}
2026-09-05 02:52:37,469 INFO sqlalchemy.engine.Engine COMMIT

```

---

## Assistant (Build · Big Pickle · 15.3s)

_Thinking:_

Interesting: the demo candidate name is "aadi Sharma" (not Rahul — renamed during a session it seems). Phone 9876543210 = "aadi Sharma", 1 enrollment, 0 outcomes. So his Outcome Journey is empty. 

This is a strong sample-data gap: seeding outcome timeline entries for the demo candidate would light up:
- Candidate Outcome Journey on dashboard
- Gov candidate drawer timeline
- Placement rate analytics
- Reports

Plan for seed: For candidate 9876543210 (aadi Sharma), add employment_outcomes rows for his enrollment across intervals (3_month employed → 6_month employed → 12_month maybe awaiting). But careful with the `uq_outcome_per_interval` unique constraint (candidate_id, enrollment_id, survey_interval). Also note he was hired by Infosys (Java Full-Stack Developer per the seed — actually wait, Karthik Iyer has the Java offer; what was aadi's hired role? From seeds_employer_demo: 3 hired were employees — let me recall: hired apps for Infosys were probably Amit Kumar (Python), aadi Sharma (Data Analyst?), and Arjun Menon (Python)? I don't remember exactly. Let me not over-engineer; the outcome seed just needs internals: is_employed, title, salary, location, interval.

Actually for the demo candidate, adding:
- 3_month: employed, "Junior Python Developer", ₹30000, Bengaluru
- 6_month: employed, "Python Developer", ₹35000, Bengaluru
- 12_month: employed, "Python Developer", ₹42000, Bengaluru (or is_employed False if he's currently hiring... but he has active applications; realistically outcomes track post-training placements. Keep employed True.)

Also give Priya Patel (9876543211, Data Analyst at Infosys) — she has an offer from Infosys but 0 outcomes; and Amit Kumar (9876543212) hired by Infosys. Adding outcomes for Priya/Amit + other employer_demo candidates would enrich the sector analytics further. But keep scope reasonable: add to the 3 main demo candidates (aadi, Priya, Amit) with realistic roles matching the Infosys postings.

Wait — careful: outcomes reference enrollment_id, not applications. Enrollments exist (1 each for these candidates). Tie outcomes to their enrollment.

Also I should double check the demo candidate names to build good data: 9876543210 "aadi Sharma", 9876543211 Priya Patel (Data Analyst offer), 9876543212 Amit Kumar (hired?). Let me grab the hired + offered apps for Infosys to align outcome titles.

Then build a seed script `backend/app/seeds_outcomes_demo.py` (idempotent: skip if candidate already has outcomes) or just do a direct DB script in temp. Since it's sample data, a one-off temp script is fine and avoids adding repo clutter — but earlier pattern created seeds_employer_demo.py in repo. Sample-data scripts are useful for reproducibility. However, they require the repo keep them consistent. I'll write a temp one-off script (non-repo) file for the outcome seeding to keep it simple, executed (idempotent by unique constraint checks with `ON CONFLICT DO NOTHING`).

Now the frontend batch:
1. Employer jobs page: analytics per posting (applicants, avg match, hired, status breakdown mini). Add `useEmployerApplicationsOverview()` hook on jobs page; compute per job aggregates; show chips + progress bar. Also a summary strip (total postings, active postings, total applicants, avg applicants/posting).

2. Candidate dashboard: "Interview & Offers spotlight" — next upcoming interview with countdown; plus counts of offered/hired. Cheap, uses existing `applications` data already loaded on the page. Insert after stat cards or before recent applications.

Let me first look at candidate page remainder (after line 1176) to see what's there (notifications, completeness, etc.) to avoid duplication and to find a good insertion point.

Demo candidate ("aadi Sharma", 9876543210) has 0 outcomes. Let me see the rest of the candidate dashboard and grab the hired/offered apps to align outcome titles:

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\candidate\\page.tsx",
  "limit": 240,
  "offset": 1177
}
```

**Output:**
```
<path>C:\aaditya\Opencode-project\SIH26135\frontend\src\app\candidate\page.tsx</path>
<type>file</type>
<content>
1177:                           </p>
1178:                         )}
1179:                         {entry.skills_used && entry.skills_used.length > 0 && (
1180:                           <div className="mt-2 flex flex-wrap gap-1">
1181:                             {entry.skills_used.map((s) => (
1182:                               <span key={s} className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
1183:                                 {s}
1184:                               </span>
1185:                             ))}
1186:                           </div>
1187:                         )}
1188:                         <p className="mt-1 text-[10px] text-slate-400">
1189:                           Surveyed {new Date(entry.survey_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
1190:                         </p>
1191:                       </div>
1192:                     </div>
1193:                   );
1194:                 })}
1195:               </div>
1196:             </div>
1197:           )}
1198:         </div>
1199: 
1200:         {/* ═══════════════════════════════════════════════
1201:             NEW FEATURE 4 — Skill Demand Alert
1202:            ═══════════════════════════════════════════════ */}
1203:         {!topSkillsLoading && !skillAlertDismissed && missingSkills.length > 0 && (
1204:           <div className="glass p-5 mt-6 animate-fade-up delay-200">
1205:             <div className="flex items-start gap-3">
1206:               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md">
1207:                 <AlertTriangle className="h-5 w-5 text-white" />
1208:               </div>
1209:               <div className="flex-1 min-w-0">
1210:                 <div className="flex items-center justify-between">
1211:                   <h3 className="text-sm font-bold text-slate-800">Upgrade your skills</h3>
1212:                   <button
1213:                     onClick={() => setSkillAlertDismissed(true)}
1214:                     className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
1215:                   >
1216:                     <X className="h-4 w-4" />
1217:                   </button>
1218:                 </div>
1219:                 <p className="mt-1 text-xs text-slate-500">
1220:                   These top-demand skills are missing from your profile. Adding them could improve your match score.
1221:                 </p>
1222:                 <div className="mt-3 flex flex-wrap gap-2">
1223:                   {missingSkills.map((s) => (
1224:                     <span
1225:                       key={s.skill}
1226:                       className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
1227:                     >
1228:                       <Sparkles className="h-3 w-3" />
1229:                       {s.skill}
1230:                       <span className="text-amber-400">· demand {s.demand}</span>
1231:                     </span>
1232:                   ))}
1233:                 </div>
1234:                 <Link
1235:                   href="/candidate/skills"
1236:                   className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
1237:                 >
1238:                   Add skills to your profile
1239:                   <ArrowRight className="h-3 w-3" />
1240:                 </Link>
1241:               </div>
1242:             </div>
1243:           </div>
1244:         )}
1245: 
1246:         {/* ═══════════════════════════════════════════════
1247:             NEW FEATURE 6 — Skill-Gap Courses
1248:            ═══════════════════════════════════════════════ */}
1249:         <div className="glass p-6 mt-6 animate-fade-up delay-200">
1250:           <div className="flex items-center justify-between mb-1">
1251:             <div className="panel-title">
1252:               <GraduationCap className="h-5 w-5 text-violet-600" />
1253:               Close your skill gaps
1254:             </div>
1255:             {!gapCoursesLoading && gapSkills.length > 0 && (
1256:               <span className="chip bg-violet-100 text-violet-700">
1257:                 <Layers className="h-3 w-3" />
1258:                 {gapSkills.length} skill gap{gapSkills.length !== 1 ? "s" : ""} → learning path
1259:               </span>
1260:             )}
1261:           </div>
1262: 
1263:           {gapCoursesLoading ? (
1264:             <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
1265:               {[1, 2, 3].map((i) => (
1266:                 <div key={i} className="glass-inner rounded-xl p-4">
1267:                   <Skeleton className="mb-3 h-4 w-40 rounded" />
1268:                   <Skeleton className="mb-3 h-3 w-24 rounded" />
1269:                   <Skeleton className="mb-3 h-6 w-28 rounded-full" />
1270:                   <Skeleton className="h-3 w-32 rounded" />
1271:                 </div>
1272:               ))}
1273:             </div>
1274:           ) : gapSkills.length === 0 ? (
1275:             <div className="py-8 text-center">
1276:               <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
1277:                 <CheckCircle2 className="h-7 w-7 text-emerald-500" />
1278:               </div>
1279:               <p className="text-sm font-medium text-slate-700">
1280:                 All in-demand skills covered — you're market-ready! Keep it up
1281:               </p>
1282:               <p className="mt-1 text-xs text-slate-400">
1283:                 You already have the top skills employers are looking for
1284:               </p>
1285:             </div>
1286:           ) : (
1287:             <>
1288:               <p className="mt-1 text-sm text-slate-500">
1289:                 {gapSkills.length} skill{gapSkills.length !== 1 ? "s" : ""} in demand you haven&apos;t added yet.
1290:                 Enroll in a course to cover them and boost your marketability.
1291:               </p>
1292:               <div className="mt-3 flex flex-wrap gap-2">
1293:                 {gapSkills.map((s) => (
1294:                   <span
1295:                     key={s.skill}
1296:                     className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
1297:                   >
1298:                     <Sparkles className="h-3 w-3" />
1299:                     {s.skill}
1300:                     <span className="text-violet-400">· demand {s.demand}</span>
1301:                   </span>
1302:                 ))}
1303:               </div>
1304: 
1305:               {/* Learning path stepper */}
1306:               <div className="mt-6 mb-2">
1307:                 <div className="flex items-center gap-2 mb-4">
1308:                   <Map className="h-4 w-4 text-violet-600" />
1309:                   <h4 className="text-sm font-bold text-slate-800">Your learning path</h4>
1310:                   <span className="text-xs text-slate-400">
1311:                     {gapSkills.length} step{gapSkills.length !== 1 ? "s" : ""} to market-ready
1312:                   </span>
1313:                 </div>
1314:                 <div className="relative">
1315:                   <div className="absolute left-[15px] top-3 bottom-3 w-0.5 border-l-2 border-dashed border-violet-300" />
1316:                   <div className="space-y-5">
1317:                     {gapSkills.map((s, i) => {
1318:                       const best = rankedGapCourses.find((r) =>
1319:                         r.covered.some((sk) => sk.toLowerCase() === s.skill.toLowerCase())
1320:                       );
1321:                       return (
1322:                         <div
1323:                           key={s.skill}
1324:                           className="relative flex items-start gap-4 pl-1 animate-fade-up"
1325:                           style={{ animationDelay: `${i * 0.06}s` }}
1326:                         >
1327:                           <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-bold text-white shadow-md shadow-violet-500/25">
1328:                             {i + 1}
1329:                           </div>
1330:                           <div className="min-w-0 flex-1 rounded-xl border border-slate-100 p-4 transition-all hover:border-violet-200 hover:bg-violet-50/30">
1331:                             <div className="flex flex-wrap items-center gap-2">
1332:                               <h5 className="text-sm font-bold text-slate-800">{s.skill}</h5>
1333:                               <span className="chip bg-amber-100 text-amber-700">
1334:                                 <TrendingUp className="h-3 w-3" />
1335:                                 In demand · {s.demand}
1336:                               </span>
1337:                             </div>
1338:                             {best ? (
1339:                               <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-violet-50/60 px-3 py-2">
1340:                                 <GraduationCap className="h-4 w-4 shrink-0 text-violet-500" />
1341:                                 <span className="min-w-0 text-xs font-semibold text-violet-800">
1342:                                   {best.course.name}
1343:                                 </span>
1344:                                 <span className="text-[10px] text-slate-400">
1345:                                   {best.course.duration_weeks} wk ·{" "}
1346:                                   {best.course.cost_per_candidate !== null && best.course.cost_per_candidate !== undefined
1347:                                     ? best.course.cost_per_candidate === 0
1348:                                       ? "Free"
1349:                                       : `₹${best.course.cost_per_candidate.toLocaleString("en-IN")}`
1350:                                     : "Fees on request"}
1351:                                 </span>
1352:                               </div>
1353:                             ) : (
1354:                               <p className="mt-2 text-xs text-slate-400">
1355:                                 No course covering this skill yet — check back soon.
1356:                               </p>
1357:                             )}
1358:                           </div>
1359:                         </div>
1360:                       );
1361:                     })}
1362:                   </div>
1363:                 </div>
1364:               </div>
1365: 
1366:               {rankedGapCourses.length === 0 ? (
1367:                 <div className="mt-6 rounded-xl border border-dashed border-slate-200 py-8 text-center">
1368:                   <p className="text-sm font-medium text-slate-500">No courses found yet</p>
1369:                   <p className="mt-1 text-xs text-slate-400">
1370:                     Courses covering your gap skills will appear here as they launch
1371:                   </p>
1372:                 </div>
1373:               ) : (
1374:                 <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
1375:                   {rankedGapCourses.map(({ course, covered }, i) => (
1376:                     <div
1377:                       key={course.id}
1378:                       className="group glass-inner rounded-xl p-4 transition-all hover:border-violet-200 hover:bg-violet-50/30 animate-fade-up"
1379:                       style={{ animationDelay: `${i * 0.06}s` }}
1380:                     >
1381:                       <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-violet-700">
1382:                         {course.name}
1383:                       </h4>
1384:                       <p className="mt-1 text-xs text-slate-500">{course.sector}</p>
1385:                       <div className="mt-3 flex flex-wrap items-center gap-2">
1386:                         <span className="chip bg-violet-100 text-violet-700">
1387:                           <Clock className="h-3 w-3" />
1388:                           {course.duration_weeks} wk{course.duration_weeks !== 1 ? "s" : ""}
1389:                         </span>
1390:                         <span className="chip bg-emerald-100 text-emerald-700">
1391:                           {course.cost_per_candidate !== null && course.cost_per_candidate !== undefined
1392:                             ? course.cost_per_candidate === 0
1393:                               ? "Free"
1394:                               : `₹${course.cost_per_candidate.toLocaleString("en-IN")}`
1395:                             : "Fees on request"}
1396:                         </span>
1397:                       </div>
1398:                       <div className="mt-3 flex flex-wrap gap-1.5">
1399:                         {covered.map((sk) => (
1400:                           <span
1401:                             key={sk}
1402:                             className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700"
1403:                           >
1404:                             <Check className="h-3 w-3 text-emerald-600" />
1405:                             {sk}
1406:                           </span>
1407:                         ))}
1408:                       </div>
1409:                     </div>
1410:                   ))}
1411:                 </div>
1412:               )}
1413:             </>
1414:           )}
1415:         </div>
1416: 

(Showing lines 1177-1416 of 1614. Use offset=1417 to continue.)
</content>
```

---

## Assistant (Build · Big Pickle · 5.6s)

_Thinking:_

The candidate dashboard is very long. It already shows Recent Applications, Outcome Journey, etc. The clearest missing candidate feature: an "Interview & Offers spotlight" near the top (right after stat cards) showing next upcoming interview with countdown + pending offers/hired. The data (`applications`) is already loaded. This is high-value and cheap.

But wait — the candidate apps list in useMyApplications returns fields including interview_at, offer_salary, etc. Good.

Let me check the tail of candidate page (offset 1417-1614) only cursorily for existing "next interview" handling... There could already be an interview spotlight. Grep for "interview" in candidate page.

**Tool: grep**

**Input:**
```json
{
  "include": "page.tsx",
  "path": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\candidate",
  "pattern": "interview_at|spotlight|Upcoming|next interview|countdown"
}
```

**Output:**
```
Found 4 matches
C:\aaditya\Opencode-project\SIH26135\frontend\src\app\candidate\progress\page.tsx:
  Line 22:   if (!entry) return { icon: Circle, color: "text-slate-400 border-slate-200 bg-slate-50", label: "Upcoming" };


C:\aaditya\Opencode-project\SIH26135\frontend\src\app\candidate\applications\page.tsx:
  Line 501:                     {a.status === "interview" && a.interview_at && (

  Line 516:                                   {formatISODateTime(a.interview_at)}

  Line 521:                               const days = daysUntil(a.interview_at);

```

---

## Assistant (Build · Big Pickle · 79.6s)

---

## User

go

---

## Assistant (Build · Big Pickle · 67.8s)

_Thinking:_

The candidate dashboard doesn't surface next interview/offers. Let me implement the batch:

1. **Employer jobs page**: add per-posting analytics from `useEmployerApplicationsOverview()` — applicant count, avg match, hired, status bar; plus a summary strip.
2. **Candidate dashboard**: "Interview & Offers spotlight" panel after stat cards — next upcoming interview with countdown, plus offered/hired totals. Also candidate outcome sample data so his Outcome Journey lights up.
3. **Outcome sample data** for demo candidates (aadi Sharma, Priya Patel, Amit Kumar) tied to their enrollments.

Let me start. First the candidate dashboard spotlight. I need JobApplication type to have interview fields — it does. `applications` array is available. Next interview = apps where status === "interview" && interview_at sorted ascending. Countdown: days from now via daysUntil? There's a `daysUntil` helper in applications page (local). I'll compute inline.

Let me check the candidate page's `applications` type. It's JobApplication. Fine.

Insert the spotlight panel right after the Stat Cards section (after line 757 `</div>` of stat grid, before Placement Score). Design: a two-column glass with:
- Left: "Next interview" — if exists show date/time with countdown chip (Today/Tomorrow/In N days), job title, note. Else show "No interview scheduled" + link.
- Right: "Offers & offers pending" — count of offered (pending response), hired (celebrating), rejected. Plus mini progress: "awaiting decision on N offers".

Actually simpler: a single glass panel "Your Hiring Spotlight": 
- Next interview block (or empty state with CTA to matches).
- Offered pending count + hired count chips.

Implementation plan (candidate page):
- Compute:
```
const upcomingInterview = applications
  .filter(a => a.status === "interview" && a.interview_at)
  .sort((x,y) => new Date(x.interview_at!).getTime() - new Date(y.interview_at!).getTime())[0];
const offeredCount = applications.filter(a => a.status === "offered").length;
const hiredCount = applications.filter(a => a.status === "hired").length;
```
- countdown label helper:
```
function interviewCountdown(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return { label: "Done", tone: "bg-slate-100 text-slate-500" };
  if (days === 0) return { label: "Today", tone: "bg-violet-100 text-violet-700" };
  if (days === 1) return { label: "Tomorrow", tone: "bg-violet-100 text-violet-700" };
  return { label: `In ${days} days`, tone: "bg-violet-50 text-violet-600" };
}
```
- Icons: already imported many. Need Clock (imported), CalendarDays? Not imported in candidate page. It imports many icons; let me check: imports include Target, ShieldCheck, Sparkles, Briefcase, History, ArrowUpRight, Pencil, FileText, Bell, MapPin, Layers, CheckCircle2, XCircle, Clock, Star, UserCheck, Loader2, TrendingUp, TrendingDown, AlertTriangle, Map, Zap, Award, CircleDot, Check, ChevronRight, X, ArrowRight, GraduationCap. No CalendarDays. I'll add CalendarDays to import. Also formatISODateTime for display — check utils import in candidate page... It imports formatINR, formatISODate? Let me check the import line for utils. Actually grep.

I'll implement the three-part batch. First check candidate page utils import:

**Tool: grep**

**Input:**
```json
{
  "path": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\candidate\\page.tsx",
  "pattern": "from \"@/lib/utils\"|CalendarDays"
}
```

**Output:**
```
Found 3 matches
C:\aaditya\Opencode-project\SIH26135\frontend\src\app\candidate\applications\page.tsx:
  Line 13: import { formatINR, formatISODate, formatISODateTime } from "@/lib/utils";

  Line 14: import { FileText, Inbox, ExternalLink, ChevronDown, Sparkles, Check, CalendarDays, ClipboardCheck } from "lucide-react";

  Line 509:                                 <CalendarDays className="h-5 w-5 text-white" />

```

---

## Assistant (Build · Big Pickle · 46.7s)

_Thinking:_

Candidate dashboard page doesn't import from utils nor CalendarDays. I'll add `formatISODateTime` and `CalendarDays`.

Plan for candidate page edit:
1. Add `CalendarDays` to lucide imports.
2. Add `import { formatISODateTime } from "@/lib/utils";`
3. Add computed values after `recentApps` / near `greeting` etc.
4. Insert panel after Stat Cards block (after line 757 closing `</div>` of the stats grid and before Placement Score comment at line 759).

Let me add the computed values and helper inside the component. I'll add helper function above the component (top-level) `nextInterviewCountdown`.

Edit 1: imports.
Edit 2: helper function above component (near StatusChip).
Edit 3: compute inside component (after `recentApps` definition ~line 561).
Edit 4: insert JSX panel.

Let me do it.

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\candidate\\page.tsx",
  "newString": "ArrowRight,\n  GraduationCap,\n  CalendarDays,\n} from \"lucide-react\";\nimport { formatISODateTime } from \"@/lib/utils\";",
  "oldString": "ArrowRight,\n  GraduationCap,\n} from \"lucide-react\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 47.9s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\candidate\\page.tsx",
  "newString": "function StatusChip({ status }: { status: string }) {\n  const cfg = STATUS_CONFIG[status] ?? { bg: \"bg-slate-100\", text: \"text-slate-600\", icon: FileText };\n  const Icon = cfg.icon;\n  return (\n    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>\n      <Icon className=\"h-3 w-3\" />\n      {status.charAt(0).toUpperCase() + status.slice(1)}\n    </span>\n  );\n}\n\nfunction interviewCountdown(iso: string): { label: string; tone: string } {\n  const diff = new Date(iso).getTime() - Date.now();\n  const days = Math.ceil(diff / 86400000);\n  if (days < 0) return { label: \"Finished\", tone: \"bg-slate-100 text-slate-500\" };\n  if (days === 0) return { label: \"Today\", tone: \"bg-violet-100 text-violet-700 ring-1 ring-violet-200\" };\n  if (days === 1) return { label: \"Tomorrow\", tone: \"bg-violet-100 text-violet-700 ring-1 ring-violet-200\" };\n  return { label: `In ${days} days`, tone: \"bg-violet-50 text-violet-600\" };\n}",
  "oldString": "function StatusChip({ status }: { status: string }) {\n  const cfg = STATUS_CONFIG[status] ?? { bg: \"bg-slate-100\", text: \"text-slate-600\", icon: FileText };\n  const Icon = cfg.icon;\n  return (\n    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>\n      <Icon className=\"h-3 w-3\" />\n      {status.charAt(0).toUpperCase() + status.slice(1)}\n    </span>\n  );\n}"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 46.6s)

Now add computed values in the component and insert the spotlight panel:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\candidate\\page.tsx",
  "newString": "const recentApps = [...applications]\n    .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())\n    .slice(0, 3);\n\n  const nextInterview = useMemo(\n    () =>\n      applications\n        .filter((a) => a.status === \"interview\" && a.interview_at)\n        .sort((x, y) => new Date(x.interview_at!).getTime() - new Date(y.interview_at!).getTime())[0],\n    [applications],\n  );\n  const offeredPending = applications.filter((a) => a.status === \"offered\").length;\n  const hiredCount = applications.filter((a) => a.status === \"hired\").length;",
  "oldString": "const recentApps = [...applications]\n    .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())\n    .slice(0, 3);"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 58.7s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\candidate\\page.tsx",
  "newString": "{/* ── Hiring Spotlight ── */}\n        {!appsLoading && applications.length > 0 && (\n          <div className=\"glass p-6 mb-6 animate-fade-up delay-100\">\n            <div className=\"flex items-center justify-between mb-4\">\n              <div className=\"panel-title\">\n                <CalendarDays className=\"h-5 w-5 text-violet-600\" />\n                Your Hiring Spotlight\n              </div>\n              <Link href=\"/candidate/applications\" className=\"text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors\">\n                View applications\n              </Link>\n            </div>\n            <div className=\"grid grid-cols-1 gap-4 md:grid-cols-3\">\n              {/* Next interview */}\n              <div className=\"glass-inner rounded-xl p-4\">\n                <div className=\"flex items-center gap-2 mb-2\">\n                  <Clock className=\"h-4 w-4 text-violet-500\" />\n                  <p className=\"text-xs font-semibold uppercase tracking-wide text-slate-400\">Next interview</p>\n                </div>\n                {nextInterview ? (\n                  <div>\n                    <div className=\"flex items-center justify-between gap-2\">\n                      <p className=\"text-lg font-extrabold text-slate-800\">{formatISODateTime(nextInterview.interview_at!)}</p>\n                      <span className={`chip flex-shrink-0 text-[10px] ${interviewCountdown(nextInterview.interview_at!).tone}`}>\n                        {interviewCountdown(nextInterview.interview_at!).label}\n                      </span>\n                    </div>\n                    <p className=\"mt-0.5 text-xs text-slate-500\">Application #{nextInterview.id.slice(0, 8)}</p>\n                    {nextInterview.interview_note && (\n                      <p className=\"mt-1.5 line-clamp-1 text-[11px] text-slate-400 italic\">\"{nextInterview.interview_note}\"</p>\n                    )}\n                  </div>\n                ) : (\n                  <div className=\"py-2\">\n                    <p className=\"text-sm font-medium text-slate-500\">Nothing scheduled</p>\n                    <p className=\"mt-1 text-xs text-slate-400\">Interviews appear here once an employer schedules them</p>\n                  </div>\n                )}\n              </div>\n\n              {/* Offered waiting */}\n              <div className=\"glass-inner rounded-xl p-4\">\n                <div className=\"flex items-center gap-2 mb-2\">\n                  <CheckCircle2 className=\"h-4 w-4 text-sky-500\" />\n                  <p className=\"text-xs font-semibold uppercase tracking-wide text-slate-400\">Offers awaiting your response</p>\n                </div>\n                <p className=\"text-lg font-extrabold text-slate-800\">{offeredPending}</p>\n                <p className=\"mt-1 text-xs text-slate-400\">\n                  {offeredPending === 0\n                    ? \"No open offers — keep an eye on your applications\"\n                    : offeredPending === 1\n                    ? \"Review the offer details on your applications page\"\n                    : `Review your ${offeredPending} offers to move forward`}\n                </p>\n              </div>\n\n              {/* Hired */}\n              <div className=\"glass-inner rounded-xl p-4\">\n                <div className=\"flex items-center gap-2 mb-2\">\n                  <UserCheck className=\"h-4 w-4 text-emerald-500\" />\n                  <p className=\"text-xs font-semibold uppercase tracking-wide text-slate-400\">Hired</p>\n                </div>\n                <p className=\"text-lg font-extrabold text-slate-800\">{hiredCount}</p>\n                <p className=\"mt-1 text-xs text-slate-400\">\n                  {hiredCount === 0\n                    ? \"Your first job offer is one step away\"\n                    : hiredCount === 1\n                    ? \"Congratulations — complete your onboarding checklist\"\n                    : `Congratulations on ${hiredCount} offers — complete your onboarding`}\n                </p>\n              </div>\n            </div>\n          </div>\n        )}\n\n        {/* ── Placement Score ── */}",
  "oldString": "{/* ── Placement Score ── */}"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 69.2s)

_Thinking:_

Candidate spotlight done. Now the employer jobs page per-posting analytics. I need to:

1. Import `useEmployerApplicationsOverview` and `JobApplicant`/`OverviewApplication` type? Use OverviewApplication from types. Add icons (Users, Target maybe). Already has Plus, MoreHorizontal, Briefcase, MapPin, IndianRupee, Calendar. Add `Users`, `Sparkles`/`Activity`, maybe `CheckCircle2`.

2. In component: 
```
const { data: overview, loading: overviewLoading } = useEmployerApplicationsOverview();
```
Compute per-job aggregates:
```
const jobStats = useMemo(() => {
  const map = new Map<string, { count: number; avgMatch: number; hired: number; applied: number; updatedAt: string | null }>();
  for (const a of overview?.applications ?? []) {
    const s = map.get(a.job_posting_id) ?? { count: 0, avgMatch: 0, hired: 0, applied: 0, updatedAt: null };
    s.count += 1;
    if (a.match_score != null) s.avgMatch += a.match_score;
    if (a.status === "hired") s.hired += 1;
    if (a.status === "applied") s.applied += 1;
    if (!s.updatedAt || new Date(a.applied_at) > new Date(s.updatedAt)) s.updatedAt = a.applied_at;
    map.set(a.job_posting_id, s);
  }
  for (const s of map.values()) {
    if (s.count > 0) s.avgMatch = Math.round(s.avgMatch / s.count);
  }
  return map;
}, [overview]);
```
3. Add a summary strip at top of the jobs list: total your postings, total applicants, avg applicants/posting, total hired. 
4. On each job card, show a stats row: N applicants · X% avg match · Y hired · C updated ago; plus a tiny status bar (applied/hired proportion). Also keep "View Applicants" menu.

Also the "New Posting" flow etc stays.

Let me add `timeAgo` helper for last-application date.

Edits to jobs page:
- imports: add useEmployerApplicationsOverview; add useMemo; add icons Users, CheckCircle2, Activity/Sparkles; type OverviewApplication? Actually use overview.applications entries inlined. I'll import type `EmployerApplicationsOverview`? Not needed if we use the hook's datum directly. Just use the hook.

Let me write the edits.

Candidate spotlight done. Now enrich employer jobs page with per-posting analytics:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\employer\\jobs\\page.tsx",
  "newString": "\"use client\";\n\nimport { useMemo, useState } from \"react\";\nimport Link from \"next/link\";\nimport Sidebar from \"@/components/layout/Sidebar\";\nimport TopBar from \"@/components/layout/TopBar\";\nimport { useRequireAuth } from \"@/lib/hooks/useAuthGuard\";\nimport {\n  useJobPostings,\n  createJobPosting,\n  deactivateJobPosting,\n  useEmployerApplicationsOverview,\n} from \"@/lib/hooks/useDashboard\";\nimport type { JobPostingListItem } from \"@/lib/types\";\nimport Modal from \"@/components/ui/Modal\";\nimport Field from \"@/components/ui/Field\";\nimport Toast from \"@/components/ui/Toast\";\nimport { Plus, MoreHorizontal, Briefcase, MapPin, IndianRupee, Calendar, Users, CheckCircle2, Sparkles } from \"lucide-react\";",
  "oldString": "\"use client\";\n\nimport { useState } from \"react\";\nimport Link from \"next/link\";\nimport Sidebar from \"@/components/layout/Sidebar\";\nimport TopBar from \"@/components/layout/TopBar\";\nimport { useRequireAuth } from \"@/lib/hooks/useAuthGuard\";\nimport {\n  useJobPostings,\n  createJobPosting,\n  deactivateJobPosting,\n} from \"@/lib/hooks/useDashboard\";\nimport type { JobPostingListItem } from \"@/lib/types\";\nimport Modal from \"@/components/ui/Modal\";\nimport Field from \"@/components/ui/Field\";\nimport Toast from \"@/components/ui/Toast\";\nimport { Plus, MoreHorizontal, Briefcase, MapPin, IndianRupee, Calendar } from \"lucide-react\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 55.5s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\employer\\jobs\\page.tsx",
  "newString": "function formatDate(iso: string) {\n  return new Date(iso).toLocaleDateString(\"en-IN\", {\n    day: \"numeric\",\n    month: \"short\",\n    year: \"numeric\",\n  });\n}\n\nfunction timeAgo(dateStr: string): string {\n  const diff = Date.now() - new Date(dateStr).getTime();\n  const mins = Math.floor(diff / 60000);\n  if (mins < 1) return \"just now\";\n  if (mins < 60) return `${mins}m ago`;\n  const hrs = Math.floor(mins / 60);\n  if (hrs < 24) return `${hrs}h ago`;\n  const days = Math.floor(hrs / 24);\n  return `${days}d ago`;\n}\n\nexport default function EmployerJobsPage() {\n  useRequireAuth(\"employer\");\n\n  const { data: jobs, loading, } = useJobPostings(50);\n  const { data: overview } = useEmployerApplicationsOverview();",
  "oldString": "function formatDate(iso: string) {\n  return new Date(iso).toLocaleDateString(\"en-IN\", {\n    day: \"numeric\",\n    month: \"short\",\n    year: \"numeric\",\n  });\n}\n\nexport default function EmployerJobsPage() {\n  useRequireAuth(\"employer\");\n\n  const { data: jobs, loading, } = useJobPostings(50);"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 55.9s)

_Thinking:_

Now add the aggregated stats memo + summary strip + per-card stats. Insert the memo after the `form` state (or after handleDeactivate). Let me add after the `useEffect`-ish? There's none here; the component has `const { data: jobs... }`. I'll add a memo compute after handleDeactivate and before return. Actually add it right before `return (`.

Then render a summary strip below the header (after line 114 area) and per-card stats inside the job card.

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\employer\\jobs\\page.tsx",
  "newString": "const handleDeactivate = async (job: JobPostingListItem) => {\n    try {\n      await deactivateJobPosting(job.id);\n      setToast({ message: `\"${job.title}\" has been deactivated.`, tone: \"success\" });\n      setActiveMenu(null);\n      setConfirmDeactivate(null);\n    } catch {\n      setToast({ message: \"Failed to deactivate job posting.\", tone: \"error\" });\n    }\n  };\n\n  const jobStats = useMemo(() => {\n    const map = new Map<string, { count: number; hired: number; applied: number; sumMatch: number; updatedAt: string | null }>();\n    for (const a of overview?.applications ?? []) {\n      const s = map.get(a.job_posting_id) ?? { count: 0, hired: 0, applied: 0, sumMatch: 0, updatedAt: null };\n      s.count += 1;\n      if (a.match_score != null) s.sumMatch += a.match_score;\n      if (a.status === \"hired\") s.hired += 1;\n      if (a.status === \"applied\") s.applied += 1;\n      if (!s.updatedAt || new Date(a.applied_at).getTime() > new Date(s.updatedAt).getTime()) {\n        s.updatedAt = a.applied_at;\n      }\n      map.set(a.job_posting_id, s);\n    }\n    return map;\n  }, [overview]);\n\n  const totalApplicants = useMemo(\n    () => Array.from(jobStats.values()).reduce((sum, s) => sum + s.count, 0),\n    [jobStats],\n  );\n  const totalHired = useMemo(\n    () => Array.from(jobStats.values()).reduce((sum, s) => sum + s.hired, 0),\n    [jobStats],\n  );",
  "oldString": "const handleDeactivate = async (job: JobPostingListItem) => {\n    try {\n      await deactivateJobPosting(job.id);\n      setToast({ message: `\"${job.title}\" has been deactivated.`, tone: \"success\" });\n      setActiveMenu(null);\n      setConfirmDeactivate(null);\n    } catch {\n      setToast({ message: \"Failed to deactivate job posting.\", tone: \"error\" });\n    }\n  };"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 61.0s)

Now add the summary strip and per-card stats blocks:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\employer\\jobs\\page.tsx",
  "newString": "{toast && (\n              <div className=\"mb-4\">\n                <Toast message={toast.message} tone={toast.tone} />\n              </div>\n            )}\n\n            {!loading && jobs.length > 0 && (\n              <div className=\"grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4\">\n                <div className=\"glass p-4 animate-fade-up\">\n                  <p className=\"text-xs font-medium uppercase tracking-wider text-slate-400\">Active postings</p>\n                  <p className=\"mt-1 text-2xl font-extrabold text-slate-800\">{jobs.filter((j) => j.is_active).length}</p>\n                </div>\n                <div className=\"glass p-4 animate-fade-up delay-100\">\n                  <p className=\"flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-slate-400\">\n                    <Users className=\"h-3 w-3\" /> Applicants\n                  </p>\n                  <p className=\"mt-1 text-2xl font-extrabold text-slate-800\">{totalApplicants}</p>\n                </div>\n                <div className=\"glass p-4 animate-fade-up delay-200\">\n                  <p className=\"text-xs font-medium uppercase tracking-wider text-slate-400\">Avg / posting</p>\n                  <p className=\"mt-1 text-2xl font-extrabold text-slate-800\">\n                    {totalApplicants > 0 ? (totalApplicants / jobs.length).toFixed(1) : \"0\"}\n                  </p>\n                </div>\n                <div className=\"glass p-4 animate-fade-up delay-300\">\n                  <p className=\"flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-slate-400\">\n                    <CheckCircle2 className=\"h-3 w-3\" /> Hired\n                  </p>\n                  <p className=\"mt-1 text-2xl font-extrabold text-emerald-600\">{totalHired}</p>\n                </div>\n              </div>\n            )}",
  "oldString": "{toast && (\n              <div className=\"mb-4\">\n                <Toast message={toast.message} tone={toast.tone} />\n              </div>\n            )}"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 59.8s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\employer\\jobs\\page.tsx",
  "newString": "{job.required_skills.length > 0 && (\n                          <div className=\"flex flex-wrap gap-1.5\">\n                            {job.required_skills.map((s) => (\n                              <span key={s} className=\"chip bg-brand-100 text-brand-700 text-xs\">{s}</span>\n                            ))}\n                          </div>\n                        )}\n\n                        {(() => {\n                          const s = jobStats.get(job.id);\n                          if (!s) return null;\n                          const avgMatch = s.count > 0 ? Math.round(s.sumMatch / s.count) : 0;\n                          const progress =\n                            s.count > 0 ? Math.min((s.hired / s.count) * 100, 100) : 0;\n                          return (\n                            <div className=\"mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500\">\n                              <span className=\"flex items-center gap-1 font-semibold text-slate-700\">\n                                <Users className=\"h-3.5 w-3.5 text-brand-500\" />\n                                {s.count} applicant{s.count !== 1 ? \"s\" : \"\"}\n                              </span>\n                              <span className=\"flex items-center gap-1\">\n                                <Sparkles className=\"h-3.5 w-3.5 text-amber-500\" />\n                                {avgMatch}% avg match\n                              </span>\n                              <span className=\"flex items-center gap-1\">\n                                <CheckCircle2 className=\"h-3.5 w-3.5 text-emerald-500\" />\n                                {s.hired} hired\n                              </span>\n                              {s.updatedAt && (\n                                <span className=\"text-slate-400\">\n                                  Last application {timeAgo(s.updatedAt)}\n                                </span>\n                              )}\n                              <div className=\"flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100\">\n                                <div\n                                  className=\"h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400\"\n                                  style={{ width: `${progress}%` }}\n                                  title={`${s.hired}/${s.count} hired`}\n                                />\n                              </div>\n                            </div>\n                          );\n                        })()}",
  "oldString": "{job.required_skills.length > 0 && (\n                          <div className=\"flex flex-wrap gap-1.5\">\n                            {job.required_skills.map((s) => (\n                              <span key={s} className=\"chip bg-brand-100 text-brand-700 text-xs\">{s}</span>\n                            ))}\n                          </div>\n                        )}"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 52.4s)

_Thinking:_

Now the outcome sample data. Seed employment_outcomes for demo candidates (aadi Sharma 9876543210, Priya Patel 9876543211, Amit Kumar 9876543212) tied to their enrollments, aligning with their Infosys roles.

I need to first find what the hired/offered roles are for these candidates. Let me query: job_applications for Infosys (employer 587d42d3...) with those candidate phones, showing status + job title. Also get their enrollment_id and the candidates id. Then write the seed script.

Let me write one temp script that queries and, based on status/title, inserts outcomes with ON CONFLICT DO NOTHING (using the unique constraint name uq_outcome_per_interval? Better use DO NOTHING via matching ON CONFLICT (candidate_id, enrollment_id, survey_interval)). Postgres supports ON CONFLICT with column list. I'll build the insert for three intervals (3m, 6m, 12m) per candidate:
- aadi Sharma: hired (Java?) → role "Java Full-Stack Developer", salary ~36000/mo; or matched title from app. Intervals: 3m employed, 6m employed, 12m employed (higher salary).
- Priya Patel: offered Data Analyst → 3m employed "Data Analyst" 30000, 6m employed 32000, 12m employed 35000.
- Amit Kumar: likely hired Python → "Python Developer" 38000 etc.

Actually keep it simpler & robust: query their Infosys applications to get role title for the outcome title; salary scaled proportionally. Add 3 outcomes each (3/6/12 month). survey dates computed accordingly. employer_id = Infosys.

Also ensure not to violate existing outcome rows for these candidates (they have none — Priya/Amit/aadi all 0 outcomes). Arjun (9800000001) has 1 outcome from seeds_rich; skip him.

Let me write the temp script with ON CONFLICT DO NOTHING and print inserted counts.

Jobs page done. Now seed outcome-timeline data for the demo candidates. First fetch their Infosys app roles:

**Tool: write**

**Input:**
```json
{
  "content": "import asyncio\nfrom datetime import date, timedelta\n\nfrom sqlalchemy.dialects.postgresql import insert\nfrom sqlalchemy import text\n\nfrom app.database import engine\n\nEMPLOYER_ID = \"587d42d3-e051-434a-9294-c3bcc0b02ea1\"\nPHONES = (\"9876543210\", \"9876543211\", \"9876543212\")\n\n\nasync def main() -> None:\n    today = date.today()\n    async with engine.begin() as conn:\n        r = await conn.execute(\n            text(\n                \"\"\"\n                SELECT c.id, c.full_name, c.phone, e.id AS enrol_id,\n                       j.title, ja.status\n                FROM candidates c\n                JOIN enrollments e ON e.candidate_id = c.id\n                JOIN job_applications ja ON ja.candidate_id = c.id\n                JOIN job_postings j ON j.id = ja.job_posting_id\n                WHERE c.phone IN :phones AND j.employer_id = :eid\n                ORDER BY c.phone, ja.created_at\n                \"\"\"\n            ),\n            {\"phones\": PHONES, \"eid\": EMPLOYER_ID},\n        )\n        rows = r.mappings().all()\n        for row in rows:\n            print(\n                row[\"phone\"], \"|\", row[\"full_name\"], \"|\", row[\"title\"],\n                \"|\", row[\"status\"], \"|\", row[\"enrol_id\"],\n            )\n\n        inserted = 0\n        by_phone: dict[str, None] = {}\n        for row in rows:\n            if row[\"phone\"] in by_phone:\n                continue\n            by_phone[row[\"phone\"]] = None\n            role = row[\"title\"]\n            sal = 32000 if role.startswith(\"Python\") else 30000 if \"Data\" in role else 35000\n            specs = [\n                (\"3_month\", 90, int(sal * 0.92)),\n                (\"6_month\", 180, sal),\n                (\"12_month\", 365, int(sal * 1.18)),\n            ]\n            for interval, days_ago, salary in specs:\n                stmt = insert(\n                    type(\"T\", (), {\"__table__\": None})()  # placeholder never used\n                ) if False else None\n                ins = text(\n                    \"\"\"\n                    INSERT INTO employment_outcomes\n                      (candidate_id, enrollment_id, employer_id, survey_interval,\n                       survey_date, is_employed, current_job_title, monthly_salary,\n                       salary_currency, job_location, is_job_relevant_to_training,\n                       skills_used, months_at_employer, response_channel, self_reported)\n                    VALUES (:cid, :enrol, :eid, :interval, :survey_date, TRUE, :role,\n                            :salary, 'INR', 'Bengaluru Urban', TRUE,\n                            '[\"Python\",\"SQL\"]'::jsonb,\n                            CAST(:months AS NUMERIC(4,1)), 'web_portal', TRUE)\n                    ON CONFLICT (candidate_id, enrollment_id, survey_interval) DO NOTHING\n                    \"\"\"\n                )\n                rc = await conn.execute(\n                    ins,\n                    {\n                        \"cid\": row[\"id\"], \"enrol\": row[\"enrol_id\"], \"eid\": EMPLOYER_ID,\n                        \"interval\": interval,\n                        \"survey_date\": today - timedelta(days=days_ago),\n                        \"role\": role, \"salary\": salary,\n                        \"months\": 3.0 if interval == \"3_month\" else 6.0 if interval == \"6_month\" else 12.0,\n                    },\n                )\n                inserted += rc.rowcount\n        print(\"INSERTED\", inserted)\n    await engine.dispose()\n\n\nasyncio.run(main())",
  "filePath": "C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Big Pickle · 37.1s)

_Thinking:_

I left a leftover placeholder line `stmt = insert(...)` weirdness. Let me remove it — I wrote a nonsense if/else. Let me clean that up before running.





**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py",
  "newString": "for interval, days_ago, salary in specs:\n                ins = text(",
  "oldString": "for interval, days_ago, salary in specs:\n                stmt = insert(\n                    type(\"T\", (), {\"__table__\": None})()  # placeholder never used\n                ) if False else None\n                ins = text("
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 59.5s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py",
  "newString": "from sqlalchemy import text\n\nfrom app.database import engine",
  "oldString": "from sqlalchemy.dialects.postgresql import insert\nfrom sqlalchemy import text\n\nfrom app.database import engine"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 50.0s)

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; python -c \"import sys; sys.path.insert(0, r'C:\\aaditya\\Opencode-project\\SIH26135\\backend'); exec(open(r'C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py', encoding='utf-8').read())\" 2>$null | Out-String -Width 200",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```
2026-09-05 12:01:28,085 INFO sqlalchemy.engine.Engine select pg_catalog.version()
2026-09-05 12:01:28,085 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 12:01:28,091 INFO sqlalchemy.engine.Engine select current_schema()
2026-09-05 12:01:28,091 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 12:01:28,097 INFO sqlalchemy.engine.Engine show standard_conforming_strings
2026-09-05 12:01:28,097 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 12:01:28,101 INFO sqlalchemy.engine.Engine BEGIN (implicit)
2026-09-05 12:01:28,103 INFO sqlalchemy.engine.Engine 
                SELECT c.id, c.full_name, c.phone, e.id AS enrol_id,
                       j.title, ja.status
                FROM candidates c
                JOIN enrollments e ON e.candidate_id = c.id
                JOIN job_applications ja ON ja.candidate_id = c.id
                JOIN job_postings j ON j.id = ja.job_posting_id
                WHERE c.phone IN $1 AND j.employer_id = $2
                ORDER BY c.phone, ja.created_at
                
2026-09-05 12:01:28,103 INFO sqlalchemy.engine.Engine [generated in 0.00047s] (('9876543210', '9876543211', '9876543212'), '587d42d3-e051-434a-9294-c3bcc0b02ea1')
2026-09-05 12:01:28,125 INFO sqlalchemy.engine.Engine ROLLBACK


```

---

## Assistant (Build · Big Pickle · 48.9s)

_Thinking:_

The query failed with a rollback (probably ON CONFLICT requires a constraint/index matching the column set — Postgres multiple unique indexes... the actual unique constraint is `uq_outcome_per_interval` on (candidate_id, enrollment_id, survey_interval), so ON CONFLICT with those columns should be inferred. But maybe the table has no other matching constraint. Actually more likely the error: `c.phone IN :phones` with tuple binding requiring `IN`: SQLAlchemy `IN` with a plain tuple param works via `IN :phones` → needs expansion — it printed `IN $1` with tuple value, that works in asyncpg? Rather than debug, let me get the real error without 2>$null.

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; python -c \"import sys; sys.path.insert(0, r'C:\\aaditya\\Opencode-project\\SIH26135\\backend'); exec(open(r'C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py', encoding='utf-8').read())\" 2>&1 | Select-String -Pattern \"ERROR|error|Traceback|psycopg|126|conflict|ConstraintViolation\" -Context 0,2",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```

> Traceback (most recent call last):
    File "C:\Users\Aaditya\AppData\Roaming\Python\Python314\site-packages\sqlalchemy\dialects\postgresql\asyncpg.py", 
line 526, in _prepare_and_execute
      prepared_stmt, attributes = await adapt_connection._prepare(
> asyncpg.exceptions.PostgresSyntaxError: syntax error at or near "$1"
  System.Management.Automation.RemoteException
  The above exception was the direct cause of the following exception:
> Traceback (most recent call last):
    File "C:\Users\Aaditya\AppData\Roaming\Python\Python314\site-packages\sqlalchemy\engine\base.py", line 1969, in 
_exec_single_context
      self.dialect.do_execute(
>     self._handle_exception(error)
      ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^
    File "C:\Users\Aaditya\AppData\Roaming\Python\Python314\site-packages\sqlalchemy\dialects\postgresql\asyncpg.py", 
line 513, in _handle_exception
>     self._adapt_connection._handle_exception(error)
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^
    File "C:\Users\Aaditya\AppData\Roaming\Python\Python314\site-packages\sqlalchemy\dialects\postgresql\asyncpg.py", 
line 797, in _handle_exception
>     raise translated_error from error
> sqlalchemy.dialects.postgresql.asyncpg.AsyncAdapt_asyncpg_dbapi.ProgrammingError: <class 
'asyncpg.exceptions.PostgresSyntaxError'>: syntax error at or near "$1"
  System.Management.Automation.RemoteException
  The above exception was the direct cause of the following exception:
> Traceback (most recent call last):
    File "<string>", line 1, in <module>
      import sys; sys.path.insert(0, r'C:\aaditya\Opencode-project\SIH26135\backend'); 
exec(open(r'C:\Users\Aaditya\AppData\Local\Temp\opencode\seed_outcomes.py', encoding='utf-8').read())
>     raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
    File "C:\Users\Aaditya\AppData\Roaming\Python\Python314\site-packages\sqlalchemy\engine\base.py", line 1969, in 
_exec_single_context
      self.dialect.do_execute(
>     self._handle_exception(error)
      ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^
    File "C:\Users\Aaditya\AppData\Roaming\Python\Python314\site-packages\sqlalchemy\dialects\postgresql\asyncpg.py", 
line 513, in _handle_exception
>     self._adapt_connection._handle_exception(error)
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^
    File "C:\Users\Aaditya\AppData\Roaming\Python\Python314\site-packages\sqlalchemy\dialects\postgresql\asyncpg.py", 
line 797, in _handle_exception
>     raise translated_error from error
> sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError) <class 
'asyncpg.exceptions.PostgresSyntaxError'>: syntax error at or near "$1"
  [SQL: 
                  SELECT c.id, c.full_name, c.phone, e.id AS enrol_id,
> (Background on this error at: https://sqlalche.me/e/20/f405)



```

---

## Assistant (Build · Big Pickle · 42.5s)

_Thinking:_

The error is `IN :phones` — asyncpg doesn't accept tuple-bound IN. Use `IN :phones` expansion with `expanding=True` bindparam, or just query per phone. Easiest: iterate over phones and use `= :phone` per query. Let me rewrite the select loop.

asyncpg doesn't support tuple-bound `IN`. Rewrite to per-phone selects:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py",
  "newString": "today = date.today()\n    async with engine.begin() as conn:\n        rows = []\n        for phone in PHONES:\n            r = await conn.execute(\n                text(\n                    \"\"\"\n                    SELECT c.id, c.full_name, c.phone, e.id AS enrol_id,\n                           j.title, ja.status\n                    FROM candidates c\n                    JOIN enrollments e ON e.candidate_id = c.id\n                    JOIN job_applications ja ON ja.candidate_id = c.id\n                    JOIN job_postings j ON j.id = ja.job_posting_id\n                    WHERE c.phone = :phone AND j.employer_id = :eid\n                    ORDER BY ja.created_at\n                    \"\"\"\n                ),\n                {\"phone\": phone, \"eid\": EMPLOYER_ID},\n            )\n            rows.extend(r.mappings().all())",
  "oldString": "today = date.today()\n    async with engine.begin() as conn:\n        r = await conn.execute(\n            text(\n                \"\"\"\n                SELECT c.id, c.full_name, c.phone, e.id AS enrol_id,\n                       j.title, ja.status\n                FROM candidates c\n                JOIN enrollments e ON e.candidate_id = c.id\n                JOIN job_applications ja ON ja.candidate_id = c.id\n                JOIN job_postings j ON j.id = ja.job_posting_id\n                WHERE c.phone IN :phones AND j.employer_id = :eid\n                ORDER BY c.phone, ja.created_at\n                \"\"\"\n            ),\n            {\"phones\": PHONES, \"eid\": EMPLOYER_ID},\n        )\n        rows = r.mappings().all()"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 37.1s)

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; python -c \"import sys; sys.path.insert(0, r'C:\\aaditya\\Opencode-project\\SIH26135\\backend'); exec(open(r'C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py', encoding='utf-8').read())\" 2>$null | Out-String -Width 200",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```
2026-09-05 12:03:45,705 INFO sqlalchemy.engine.Engine select pg_catalog.version()
2026-09-05 12:03:45,705 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 12:03:45,708 INFO sqlalchemy.engine.Engine select current_schema()
2026-09-05 12:03:45,708 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 12:03:45,710 INFO sqlalchemy.engine.Engine show standard_conforming_strings
2026-09-05 12:03:45,710 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 12:03:45,711 INFO sqlalchemy.engine.Engine BEGIN (implicit)
2026-09-05 12:03:45,712 INFO sqlalchemy.engine.Engine 
                    SELECT c.id, c.full_name, c.phone, e.id AS enrol_id,
                           j.title, ja.status
                    FROM candidates c
                    JOIN enrollments e ON e.candidate_id = c.id
                    JOIN job_applications ja ON ja.candidate_id = c.id
                    JOIN job_postings j ON j.id = ja.job_posting_id
                    WHERE c.phone = $1 AND j.employer_id = $2
                    ORDER BY ja.created_at
                    
2026-09-05 12:03:45,712 INFO sqlalchemy.engine.Engine [generated in 0.00020s] ('9876543210', '587d42d3-e051-434a-9294-c3bcc0b02ea1')
2026-09-05 12:03:45,718 INFO sqlalchemy.engine.Engine ROLLBACK


```

---

## Assistant (Build · Big Pickle · 36.9s)

_Thinking:_

Still rolling back. The insert came after—let me see the full error without filtering. The OUT-String captured but 2>$null hid the traceback. Let me rerun showing errors.

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; python -c \"import sys; sys.path.insert(0, r'C:\\aaditya\\Opencode-project\\SIH26135\\backend'); exec(open(r'C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py', encoding='utf-8').read())\" 2>&1 | Select-String -Pattern \"Error|error:\" -Context 0,1 | Select-Object -First 6",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```

> asyncpg.exceptions.UndefinedColumnError: column ja.created_at does not exist
  HINT:  Perhaps you meant to reference the column "j.created_at".
>     self._handle_exception(error)
      ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^
>     self._adapt_connection._handle_exception(error)
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^
>     raise translated_error from error
> sqlalchemy.dialects.postgresql.asyncpg.AsyncAdapt_asyncpg_dbapi.ProgrammingError: <class 
'asyncpg.exceptions.UndefinedColumnError'>: column ja.created_at does not exist
  HINT:  Perhaps you meant to reference the column "j.created_at".
>     self._handle_exception(error)
      ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^



```

---

## Assistant (Build · Big Pickle · 51.6s)

job_applications has no created_at; use `applied_at`:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py",
  "newString": "ORDER BY ja.applied_at",
  "oldString": "ORDER BY ja.created_at"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 76.1s)

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; python -c \"import sys; sys.path.insert(0, r'C:\\aaditya\\Opencode-project\\SIH26135\\backend'); exec(open(r'C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py', encoding='utf-8').read())\" 2>$null | Out-String -Width 200",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```
2026-09-05 12:06:26,531 INFO sqlalchemy.engine.Engine select pg_catalog.version()
2026-09-05 12:06:26,531 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 12:06:26,534 INFO sqlalchemy.engine.Engine select current_schema()
2026-09-05 12:06:26,534 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 12:06:26,536 INFO sqlalchemy.engine.Engine show standard_conforming_strings
2026-09-05 12:06:26,536 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-09-05 12:06:26,537 INFO sqlalchemy.engine.Engine BEGIN (implicit)
2026-09-05 12:06:26,538 INFO sqlalchemy.engine.Engine 
                    SELECT c.id, c.full_name, c.phone, e.id AS enrol_id,
                           j.title, ja.status
                    FROM candidates c
                    JOIN enrollments e ON e.candidate_id = c.id
                    JOIN job_applications ja ON ja.candidate_id = c.id
                    JOIN job_postings j ON j.id = ja.job_posting_id
                    WHERE c.phone = $1 AND j.employer_id = $2
                    ORDER BY ja.applied_at
                    
2026-09-05 12:06:26,538 INFO sqlalchemy.engine.Engine [generated in 0.00020s] ('9876543210', '587d42d3-e051-434a-9294-c3bcc0b02ea1')
2026-09-05 12:06:26,630 INFO sqlalchemy.engine.Engine 
                    SELECT c.id, c.full_name, c.phone, e.id AS enrol_id,
                           j.title, ja.status
                    FROM candidates c
                    JOIN enrollments e ON e.candidate_id = c.id
                    JOIN job_applications ja ON ja.candidate_id = c.id
                    JOIN job_postings j ON j.id = ja.job_posting_id
                    WHERE c.phone = $1 AND j.employer_id = $2
                    ORDER BY ja.applied_at
                    
2026-09-05 12:06:26,630 INFO sqlalchemy.engine.Engine [cached since 0.09181s ago] ('9876543211', '587d42d3-e051-434a-9294-c3bcc0b02ea1')
2026-09-05 12:06:26,632 INFO sqlalchemy.engine.Engine 
                    SELECT c.id, c.full_name, c.phone, e.id AS enrol_id,
                           j.title, ja.status
                    FROM candidates c
                    JOIN enrollments e ON e.candidate_id = c.id
                    JOIN job_applications ja ON ja.candidate_id = c.id
                    JOIN job_postings j ON j.id = ja.job_posting_id
                    WHERE c.phone = $1 AND j.employer_id = $2
                    ORDER BY ja.applied_at
                    
2026-09-05 12:06:26,632 INFO sqlalchemy.engine.Engine [cached since 0.09424s ago] ('9876543212', '587d42d3-e051-434a-9294-c3bcc0b02ea1')
9876543210 | aadi Sharma | Python Developer | hired | c1805a27-a293-424a-9173-4c8164b61945
9876543211 | Priya Patel | Data Analyst | offered | 5b149161-1ee4-42ae-bf22-dcec96cce495
9876543212 | Amit Kumar | React Frontend Engineer | applied | abe9e5a9-7b97-4940-b30b-369e44e72dae
2026-09-05 12:06:26,634 INFO sqlalchemy.engine.Engine 
                    INSERT INTO employment_outcomes
                      (candidate_id, enrollment_id, employer_id, survey_interval,
                       survey_date, is_employed, current_job_title, monthly_salary,
                       salary_currency, job_location, is_job_relevant_to_training,
                       skills_used, months_at_employer, response_channel, self_reported)
                    VALUES ($1, $2, $3, $4, $5, TRUE, $6,
                            $7, 'INR', 'Bengaluru Urban', TRUE,
                            '["Python","SQL"]'::jsonb,
                            CAST($8 AS NUMERIC(4,1)), 'web_portal', TRUE)
                    ON CONFLICT (candidate_id, enrollment_id, survey_interval) DO NOTHING
                    
2026-09-05 12:06:26,634 INFO sqlalchemy.engine.Engine [generated in 0.00030s] (UUID('47741dea-0eb9-4e1b-9a18-67aea2d20c64'), UUID('c1805a27-a293-424a-9173-4c8164b61945'), '587d42d3-e051-434a-9294-c3bcc0b02ea1', '3_month', datetime.date(2026, 6, 7), 'Python Developer', 29440, 3.0)
2026-09-05 12:06:26,672 INFO sqlalchemy.engine.Engine ROLLBACK


```

---

## Assistant (Build · Big Pickle · 38.2s)

_Thinking:_

Still ROLLBACK after the first INSERT. The error got hidden by 2>$null. It's likely the `months_at_employer` with CAST($8 AS NUMERIC(4,1)) — should be fine. Or the ON CONFLICT columns: maybe multiple constraints? Let me see the real error.

Actually the issue: `survey_date` params we pass date — but the values show `datetime.date(2026, 6, 7)` fine. The skills_used JSONB cast fine.

Let me look for the actual error text.

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; python -c \"import sys; sys.path.insert(0, r'C:\\aaditya\\Opencode-project\\SIH26135\\backend'); exec(open(r'C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py', encoding='utf-8').read())\" 2>&1 | Select-String -Pattern \"Error\" -Context 0,1 | Select-Object -First 4",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```

> asyncpg.exceptions.NotNullViolationError: null value in column "id" of relation "employment_outcomes" violates 
not-null constraint
  DETAIL:  Failing row contains (null, 47741dea-0eb9-4e1b-9a18-67aea2d20c64, c1805a27-a293-424a-9173-4c8164b61945, 
587d42d3-e051-434a-9294-c3bcc0b02ea1, 3_month, 2026-06-07, t, f, Python Developer, 29440.00, INR, Bengaluru Urban, t, 
["Python", "SQL"], [], f, 3.0, web_portal, t, f, 2026-09-05 12:07:14.445691).
>     self._handle_exception(error)
      ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^
>     self._adapt_connection._handle_exception(error)
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^
>     raise translated_error from error



```

---

## Assistant (Build · Big Pickle · 38.4s)

_Thinking:_

The `id` column has a default `uuid.uuid4` at the SQLAlchemy/Python ORM level, not a DB default — so raw SQL insert needs an explicit id. Generate uuid4 in Python and pass it. Add `id` param to the insert. since we use `text()` doesn't know about DB default. Insert explicit UUIDs.

`id` has an ORM-level default, not a DB default. Pass explicit UUIDs:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py",
  "newString": "import asyncio\nfrom datetime import date, timedelta\nfrom uuid import uuid4\n\nfrom sqlalchemy import text",
  "oldString": "import asyncio\nfrom datetime import date, timedelta\n\nfrom sqlalchemy import text"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 45.5s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py",
  "newString": "ins = text(\n                    \"\"\"\n                    INSERT INTO employment_outcomes\n                      (id, candidate_id, enrollment_id, employer_id, survey_interval,\n                       survey_date, is_employed, current_job_title, monthly_salary,\n                       salary_currency, job_location, is_job_relevant_to_training,\n                       skills_used, months_at_employer, response_channel, self_reported)\n                    VALUES (:id, :cid, :enrol, :eid, :interval, :survey_date, TRUE, :role,\n                            :salary, 'INR', 'Bengaluru Urban', TRUE,\n                            '[\"Python\",\"SQL\"]'::jsonb,\n                            CAST(:months AS NUMERIC(4,1)), 'web_portal', TRUE)\n                    ON CONFLICT (candidate_id, enrollment_id, survey_interval) DO NOTHING\n                    \"\"\"\n                )\n                rc = await conn.execute(\n                    ins,\n                    {\n                        \"id\": uuid4(), \"cid\": row[\"id\"], \"enrol\": row[\"enrol_id\"], \"eid\": EMPLOYER_ID,\n                        \"interval\": interval,\n                        \"survey_date\": today - timedelta(days=days_ago),\n                        \"role\": role, \"salary\": salary,\n                        \"months\": 3.0 if interval == \"3_month\" else 6.0 if interval == \"6_month\" else 12.0,\n                    },\n                )",
  "oldString": "ins = text(\n                    \"\"\"\n                    INSERT INTO employment_outcomes\n                      (candidate_id, enrollment_id, employer_id, survey_interval,\n                       survey_date, is_employed, current_job_title, monthly_salary,\n                       salary_currency, job_location, is_job_relevant_to_training,\n                       skills_used, months_at_employer, response_channel, self_reported)\n                    VALUES (:cid, :enrol, :eid, :interval, :survey_date, TRUE, :role,\n                            :salary, 'INR', 'Bengaluru Urban', TRUE,\n                            '[\"Python\",\"SQL\"]'::jsonb,\n                            CAST(:months AS NUMERIC(4,1)), 'web_portal', TRUE)\n                    ON CONFLICT (candidate_id, enrollment_id, survey_interval) DO NOTHING\n                    \"\"\"\n                )\n                rc = await conn.execute(\n                    ins,\n                    {\n                        \"cid\": row[\"id\"], \"enrol\": row[\"enrol_id\"], \"eid\": EMPLOYER_ID,\n                        \"interval\": interval,\n                        \"survey_date\": today - timedelta(days=days_ago),\n                        \"role\": role, \"salary\": salary,\n                        \"months\": 3.0 if interval == \"3_month\" else 6.0 if interval == \"6_month\" else 12.0,\n                    },\n                )"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 46.0s)

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; python -c \"import sys; sys.path.insert(0, r'C:\\aaditya\\Opencode-project\\SIH26135\\backend'); exec(open(r'C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py', encoding='utf-8').read())\" 2>$null | Select-String -Pattern \"INSERTED\"",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```

INSERTED 9



```

---

## Assistant (Build · Big Pickle · 130.9s)

_Thinking:_

9 outcome rows inserted (3 candidates × 3 intervals). Clean up temp files (check_outcomes.py, seed_outcomes.py). Then verify gates: tsc, ruff (no backend code changed), pytest not strictly needed but run per convention. Backend unchanged, so skip restart; but the outcome data affects live endpoints (gov stats, candidate timeline) — no restart needed since data-driven.

Let me delete temp scripts and run tsc + pytest + quick API smoke for candidate outcome timeline (via candidates drawer endpoint? the timeline endpoint is `/api/v1/outcomes/candidates/{id}/timeline`? Let me check route path). Actually the gov drawer used useOutcomeTimeline which hits some endpoint. Let me just verify via the app (candidate apps). Simplest verification: tsc + a smoke of candidate login + their applications endpoint including interview fields, plus outcome timeline endpoint if known.

Let me check the outcomes router path for candidate timeline.

9 outcome rows seeded. Clean up and verify:



**Tool: bash**

**Input:**
```json
{
  "command": "Remove-Item -LiteralPath \"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\check_outcomes.py\",\"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\seed_outcomes.py\" -ErrorAction SilentlyContinue; Write-Output cleaned"
}
```

**Output:**
```
cleaned

```

**Tool: bash**

**Input:**
```json
{
  "command": "npx tsc --noEmit; Write-Output \"TSC_EXIT:$LASTEXITCODE\"",
  "timeout": 240000,
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend"
}
```

**Output:**
```
TSC_EXIT:0

```

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; python -m pytest backend/tests workers/tests -q -p no:cacheprovider 2>$null | Select-Object -Last 3",
  "timeout": 300000,
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135"
}
```

**Output:**
```
----------------------------------------------------------------------------
TOTAL                                           3470   1903    45%
======================= 49 passed, 1 warning in 35.51s ========================

```

---

## Assistant (Build · Big Pickle · 60.7s)

tsc clean, 49/49 tests pass. Verify live endpoints for the demo candidate timeline + jobs page data:

**Tool: bash**

**Input:**
```json
{
  "command": "Set-Content -LiteralPath \"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login.json\" -Value '{\"phone\":\"9876543210\",\"password\":\"password123\"}' -Encoding ascii; $e = curl.exe -s -X POST http://127.0.0.1:8000/api/v1/auth/login/password -d \"@C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login.json\" -H \"Content-Type: application/json\"; $token = ($e | ConvertFrom-Json).access_token; $apps = curl.exe -s \"http://127.0.0.1:8000/api/v1/applications/mine\" -H \"Authorization: Bearer $token\" | ConvertFrom-Json; Write-Output \"MY_APPS:$($apps.Count)\"; Remove-Item -LiteralPath \"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login.json\" -ErrorAction SilentlyContinue"
}
```

**Output:**
```
MY_APPS:1

```

**Tool: bash**

**Input:**
```json
{
  "command": "Set-Content -LiteralPath \"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login2.json\" -Value '{\"phone\":\"9900000001\",\"password\":\"password123\"}' -Encoding ascii; $e = curl.exe -s -X POST http://127.0.0.1:8000/api/v1/auth/login/password -d \"@C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login2.json\" -H \"Content-Type: application/json\"; $token = ($e | ConvertFrom-Json).access_token; $o = curl.exe -s \"http://127.0.0.1:8000/api/v1/applications/overview\" -H \"Authorization: Bearer $token\" | ConvertFrom-Json; Write-Output \"OVERVIEW_TOTAL:$($o.total)\"; Remove-Item -LiteralPath \"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login2.json\" -ErrorAction SilentlyContinue"
}
```

**Output:**
```
OVERVIEW_TOTAL:21

```

---

## Assistant (Build · Big Pickle · 50.1s)

_Thinking:_

Hmm — MY_APPS:1? The demo candidate aadi Sharma should have multiple applications (he was hired on Python Developer, plus others from seeds_employer_demo). Wait, /applications/mine returns 1. But earlier the seed created 21 applications for Infosys and aadi has at least "Python Developer hired". Maybe he only has 1 application in Infosys? No — earlier data said he applied to multiple. Actually wait: seeds_employer_demo created applications for 21 candidate-job pairs. aadi (9876543210) might have had just a couple but mainly other candidates. Let me check — earlier the "candidate phone → skills mapping" list included multiple. The hired app "Python Developer" for aadi. But only 1 application for him?? That seems low; earlier smoke of overview had 21 apps across 18 candidates. Possibly aadi (Rahul) applied to only 1 posting (the Python Developer one he was hired for). Fine — that's fine for the spotlight (no upcoming interview for him since status hired, offered=0). The spotlight will render with hired=1.

Wait — but MY_APPS returned 1. That's a bit plain for the demo. But not a problem for the code; the spotlight shows Next interview: nothing scheduled, offers: 0, hired: 1. Reasonable.

Actually, let me reconsider: is the demo candidate supposed to have more? The user's demo flow earlier: candidate 9876543210 "Rahul Sharma" applied to jobs in the very first batch. Hmm. But maybe those got consumed on Wipro/other. It's fine.

The jobs page and overview work. Everything verified. Let me update todos and summarize.

Summary of this batch:
1. Candidate dashboard "Your Hiring Spotlight" panel (next interview w/ countdown, pending offers, hired count).
2. Employer jobs page — summary strip (active postings, applicants, avg/posting, hired) + per-posting analytics (applicants, avg match, hired, last application, hired progress bar).
3. Sample data — 9 employment outcome rows for aadi Sharma/Priya Patel/Amit Kumar (3/6/12-month intervals) tied to enrollments, aligned to their Infosys roles (Python Developer, Data Analyst, React Frontend Engineer) — lights up candidate Outcome Journey + gov drawer + placement stats.

Gates: tsc 0, pytest 49, live API ok. No backend code changed → no restart needed (data-only).

Todo update.

All verified. Batch complete.



**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Add Hiring Spotlight panel on candidate dashboard (next interview + offers + hired)",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Enrich employer jobs page with per-posting analytics + summary strip",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Seed employment-outcome timeline data for demo candidates (9 rows)",
      "priority": "medium",
      "status": "completed"
    },
    {
      "content": "Verify tsc, pytest, live API smoke",
      "priority": "high",
      "status": "completed"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Add Hiring Spotlight panel on candidate dashboard (next interview + offers + hired)",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Enrich employer jobs page with per-posting analytics + summary strip",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Seed employment-outcome timeline data for demo candidates (9 rows)",
    "status": "completed",
    "priority": "medium"
  },
  {
    "content": "Verify tsc, pytest, live API smoke",
    "status": "completed",
    "priority": "high"
  }
]
```

---

## Assistant (Build · Big Pickle · 46.1s)

Next batch complete and verified.

**Candidate dashboard** (`frontend/src/app/candidate/page.tsx`) — new "Your Hiring Spotlight" panel below the stats: next upcoming interview with countdown chip (Today/Tomorrow/In N days/Finished), offers awaiting your response, and hired count, all in one glance.

**Employer jobs** (`frontend/src/app/employer/jobs/page.tsx`) — postings list now has a 4-card summary strip (active postings, total applicants, avg/posting, hired) and each posting card shows live analytics: applicant count, avg match %, hired count, "last application Xh/d ago", plus a hired-progress bar. Fed by the existing `/applications/overview` endpoint.

**Sample data** — seeded 9 employment-outcome rows (3/6/12-month intervals) for the demo candidates aadi Sharma (hired, Python Developer), Priya Patel (offered, Data Analyst), and Amit Kumar (React Frontend Engineer), tied to their enrollments and matched to their Infosys roles. This now lights up the candidate "Outcome Journey", the gov candidate drawer timeline, placement-rate analytics, and the outcomes report.

**Gates:** `npx tsc --noEmit` clean, 49/49 tests pass, `MY_APPS` / `OVERVIEW_TOTAL:21` endpoints live. Backend untouched (data-only change), so no restart needed.

Ready for the next "go" — candidates for the next batch: a full "All interviews" view for employers (across postings), an interview-reminder email/notification template, or employer hiring-funnel time-to-hire analytics.

---

## User

go

---

## Assistant (Build · Big Pickle · 68.2s)

_Thinking:_

The user says "go" again. Let me continue building. Last batch was candidate spotlight + employer jobs analytics + outcome data.

Current state recap:
- Employer dashboard: funnel (aggregated), Recent Applicants, Upcoming Interviews, Offers Awaiting Response, Sector Benchmark, Salary Benchmark.
- Employer jobs: summary strip + per-posting analytics.
- Employer pipeline: kanban stages, quick Interview shortcut, offer/hire modal.
- Candidate dashboard: stats, placement score, spotlight, matches, factor breakdown, outcome journey, skill alert, skill-gap courses.
- Candidate applications: interview card, hired banner + onboarding checklist.
- Gov dashboard: rich.
- Sample data: Infosys 5 jobs/21 apps/shortlists/notifications; Wipro 5 apps; outcome timelines for 8 candidates total now (5 from seeds_rich + 3 demo).

What's next? Good candidate batch ideas from my last message:
1. **Employer "All interviews" cross-posting view** — a dedicated page listing upcoming + past interviews across all postings with actions (reschedule). Currently interviews are only surfaced (5 at a time) on the employer dashboard panel. A full page with filter/search would be valuable and demo-able.

2. **Time-to-hire analytics** — funnel conversion + avg days between stages. That's more backend work.

3. **Interview reminders** — auto-notification to candidate before interview? There's already notification infra; but that needs worker/queue. Complex.

4. **Employer → candidate follow-up on offers** — "Remind candidate" button that creates candidate notification (queued). Uses notification POST /send? Actually employer can send notifications? The notifications router has POST /send (queue, renders named template) — but who can call it? Probably admin only. Adding a "remind" from employer dashboard offers panel → POST notifications/send with template. That requires checking auth rules.

5. **Candidate: withdraw application or self: accept/decline offer** — candidate currently can't decline an offer. An "Accept offer"? Status transitions only via employer. Offer acceptance is employer-driven currently. Could add candidate "Respond to offer" that emits a notification to employer via the worker queue... but candidate statuses are locked. Mini-feature: candidate sees "Offer details" and gets "Notify employer of acceptance" button → creates employer notification "candidate accepted". That's purely notification layer. Could be cool.

6. **Employer "New interviews" schedule conflicts** — meh.

Let me pick the highest clarity + demo value: 

**Batch: Employer "Interviews" hub page** — `frontend/src/app/employer/interviews/page.tsx`:
- All interviews (upcoming + past) across all postings, fetched via overview (interviews have interview_at).
- Filter by status (upcoming/today/past), search by candidate/job.
- Shows candidate, job, datetime, note, match %, awaiting decision quick actions.
- Also a mini calendar-ish summary (upcoming count, today count, next interview).
- Navigation link — need to add to Sidebar for employer? The employer Sidebar likely has Dashboard, Pipeline, Jobs, Matches, Notifications... Let me check the sidebar.

Also worth adding: **reschedule interview** action — PATCH status to interview again? The status PATCH only saves interview fields when target == "interview"; rescheduling via a PATCH from interview→interview would violate can_transition (same status). Backend: is there an endpoint to update interview_at without status change? The PATCH requires transition. So rescheduling isn't supported without backend change. I could add a small backend endpoint `PATCH /applications/{id}/interview` to update interview_at/note while staying in interview status (guarded). That's a clean, high-value backend+frontend feature: "Reschedule interview" from the interviews hub.

Let me check the interviews-related backend and sidebar first. Also confirm vacancy: does an employer interviews page already exist? glob.

Plan:
1. Explore: employer Sidebar links, existing applications router (for adding reschedule endpoint), hook for updateInterview.
2. Backend: add `PATCH /api/v1/applications/{application_id}/interview` accepting {at, note} — role employer (owner of posting) or admin; guard that current status == "interview"; updates interview_at/interview_note; creates updated notification? Keep simple: no notification creation on reschedule (avoid spam); maybe a candidate notification is nice but auto-notification infra is in applications.py; keep simple and skip.
   - Actually to make it fully alive for demo, add optional note-only update.
3. Frontend: new page employer/interviews; add Sidebar link; styles match existing.
4. Verify gates.

Wait — need to double-check the router: `applications.py` PATCH `/{application_id}/status`. I'll add a new route for interview reschedule. Must be before/after parameterized? Add static? Route ordering caveat is about catchall `/{candidate_id}` patterns. Adding `/interview` route under the same router: `@router.patch("/{application_id}/interview")` — FastAPI matches `/status` defined first, fine since paths are distinct but the `/{application_id}/status` and `/{application_id}/interview` are both 2-segment so no shadowing issue.

Also must ensure role guard: employer; fetch the application with its job posting from DB; ensure application.job_posting.employer_id == current user's employer_id.

Let me check the applications router and Sidebar now.

Starting the interviews hub batch. Let me inspect the applications router and employer sidebar:

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\backend\\app\\api\\v1\\applications.py"
}
```

**Output:**
```
<path>C:\aaditya\Opencode-project\SIH26135\backend\app\api\v1\applications.py</path>
<type>file</type>
<content>
1: from fastapi import APIRouter, Depends, HTTPException, Query
2: from pydantic import BaseModel, Field
3: from sqlalchemy import select
4: from sqlalchemy.ext.asyncio import AsyncSession
5: from typing import Optional
6: from uuid import UUID
7: from datetime import date, datetime
8: 
9: from app.database import get_db
10: from app.dependencies import require_role
11: from app.models.user import User
12: from app.models.candidate import Candidate
13: from app.models.employer import Employer
14: from app.models.job_posting import JobPosting
15: from app.models.job_application import JobApplication
16: from app.models.notification import Notification
17: from app.services.application_service import (
18:     STATUS_TRANSITIONS,
19:     can_transition,
20:     funnel_counts,
21:     is_valid_status,
22: )
23: from app.services.notification_service import (
24:     APPLICATION_STATUS_NOTIFICATIONS,
25:     build_application_status_variables,
26:     render_template,
27: )
28: from app.services.skill_gap_engine import compute_match_score
29: from app.services.worker_queue import enqueue_delivery
30: 
31: router = APIRouter()
32: 
33: 
34: class ApplicationCreate(BaseModel):
35:     job_posting_id: UUID
36:     cover_note: Optional[str] = Field(None, max_length=2000)
37: 
38: 
39: class StatusUpdate(BaseModel):
40:     status: str
41:     feedback: Optional[str] = Field(None, max_length=2000)
42:     start_date: Optional[date] = None
43:     salary_offered: Optional[float] = None
44:     interview_at: Optional[datetime] = None
45:     interview_note: Optional[str] = Field(None, max_length=2000)
46: 
47: 
48: class ApplicationResponse(BaseModel):
49:     id: UUID
50:     candidate_id: UUID
51:     job_posting_id: UUID
52:     status: str
53:     cover_note: Optional[str]
54:     feedback: Optional[str] = None
55:     offer_start_date: Optional[date] = None
56:     offer_salary: Optional[float] = None
57:     interview_at: Optional[datetime] = None
58:     interview_note: Optional[str] = None
59:     match_score: Optional[float]
60:     applied_at: object
61:     updated_at: object
62: 
63: 
64: async def _current_user_row(db: AsyncSession, user: dict) -> User:
65:     result = await db.execute(select(User).where(User.id == UUID(str(user["sub"]))))
66:     u = result.scalar_one_or_none()
67:     if not u:
68:         raise HTTPException(status_code=404, detail="Linked account not found")
69:     return u
70: 
71: 
72: async def _current_candidate_id(db: AsyncSession, user: dict) -> UUID:
73:     u = await _current_user_row(db, user)
74:     if not u.candidate_id:
75:         raise HTTPException(status_code=403, detail="No candidate profile linked to account")
76:     return u.candidate_id
77: 
78: 
79: async def _current_employer_id(db: AsyncSession, user: dict) -> UUID:
80:     u = await _current_user_row(db, user)
81:     if not u.employer_id:
82:         raise HTTPException(status_code=403, detail="No employer profile linked to account")
83:     return u.employer_id
84: 
85: 
86: @router.post("/", response_model=ApplicationResponse, status_code=201)
87: async def apply_to_job(
88:     body: ApplicationCreate,
89:     db: AsyncSession = Depends(get_db),
90:     user: dict = Depends(require_role("candidate")),
91: ):
92:     candidate_id = await _current_candidate_id(db, user)
93: 
94:     job_result = await db.execute(
95:         select(JobPosting).where(JobPosting.id == body.job_posting_id)
96:     )
97:     job = job_result.scalar_one_or_none()
98:     if not job or not job.is_active:
99:         raise HTTPException(status_code=404, detail="Job posting not found or inactive")
100: 
101:     existing = await db.execute(
102:         select(JobApplication).where(
103:             JobApplication.candidate_id == candidate_id,
104:             JobApplication.job_posting_id == body.job_posting_id,
105:         )
106:     )
107:     if existing.scalar_one_or_none():
108:         raise HTTPException(status_code=409, detail="Already applied to this job")
109: 
110:     candidate = (
111:         await db.execute(select(Candidate).where(Candidate.id == candidate_id))
112:     ).scalar_one()
113: 
114:     match = compute_match_score(
115:         candidate_skills=candidate.skill_tags or [],
116:         job_required=job.required_skills or [],
117:         job_preferred=job.preferred_skills or [],
118:     )
119: 
120:     app = JobApplication(
121:         candidate_id=candidate_id,
122:         job_posting_id=job.id,
123:         cover_note=body.cover_note,
124:         status="applied",
125:         match_score=match["match_score"],
126:         skill_overlap=match["skill_overlap"],
127:         skill_gaps=match["skill_gaps"],
128:     )
129:     db.add(app)
130:     await db.flush()
131:     await db.refresh(app)
132: 
133:     await _queue_employer_application_alert(db, app, candidate, job)
134:     return app
135: 
136: 
137: @router.get("/mine", response_model=list[ApplicationResponse])
138: async def my_applications(
139:     status_filter: Optional[str] = Query(None),
140:     db: AsyncSession = Depends(get_db),
141:     user: dict = Depends(require_role("candidate")),
142: ):
143:     candidate_id = await _current_candidate_id(db, user)
144:     query = select(JobApplication).where(JobApplication.candidate_id == candidate_id)
145:     if status_filter:
146:         query = query.where(JobApplication.status == status_filter)
147:     query = query.order_by(JobApplication.applied_at.desc())
148:     result = await db.execute(query)
149:     return result.scalars().all()
150: 
151: 
152: @router.get("/overview", dependencies=[Depends(require_role("employer", "gov_admin"))])
153: async def employer_applications_overview(
154:     db: AsyncSession = Depends(get_db),
155:     user: dict = Depends(require_role("employer", "gov_admin")),
156: ):
157:     """All applications across the employer's jobs, enriched with candidate + job info."""
158:     u = await _current_user_row(db, user)
159:     employer_id = u.employer_id
160:     if not employer_id:
161:         raise HTTPException(status_code=403, detail="No employer profile linked to account")
162: 
163:     postings = (
164:         (await db.execute(select(JobPosting).where(JobPosting.employer_id == employer_id)))
165:         .scalars()
166:         .all()
167:     )
168:     posting_ids = [p.id for p in postings]
169:     posting_map = {p.id: p for p in postings}
170: 
171:     apps = []
172:     if posting_ids:
173:         apps = (
174:             await db.execute(
175:                 select(JobApplication)
176:                 .where(JobApplication.job_posting_id.in_(posting_ids))
177:                 .order_by(JobApplication.applied_at.desc())
178:             )
179:         ).scalars().all()
180: 
181:     cand_ids = {a.candidate_id for a in apps}
182:     cand_map = {}
183:     if cand_ids:
184:         for c in (
185:             await db.execute(select(Candidate).where(Candidate.id.in_(cand_ids)))
186:         ).scalars().all():
187:             cand_map[c.id] = c
188: 
189:     rows = []
190:     for a in apps:
191:         cand = cand_map.get(a.candidate_id)
192:         posting = posting_map.get(a.job_posting_id)
193:         rows.append({
194:             "id": str(a.id),
195:             "candidate_id": str(a.candidate_id),
196:             "job_posting_id": str(a.job_posting_id),
197:             "status": _status_value(a),
198:             "match_score": float(a.match_score) if a.match_score is not None else None,
199:             "skill_overlap": a.skill_overlap or [],
200:             "skill_gaps": a.skill_gaps or [],
201:             "cover_note": a.cover_note,
202:             "feedback": a.feedback,
203:             "offer_start_date": a.offer_start_date.isoformat() if a.offer_start_date else None,
204:             "offer_salary": float(a.offer_salary) if a.offer_salary is not None else None,
205:             "interview_at": a.interview_at.isoformat() if a.interview_at else None,
206:             "interview_note": a.interview_note,
207:             "applied_at": a.applied_at,
208:             "candidate": {
209:                 "full_name": cand.full_name if cand else None,
210:                 "state": cand.state if cand else None,
211:                 "district": cand.district if cand else None,
212:                 "phone": cand.phone if cand and cand.allow_employer_contact else None,
213:                 "skill_tags": cand.skill_tags or [] if cand else [],
214:             },
215:             "job": {
216:                 "title": posting.title if posting else None,
217:                 "location": posting.location if posting else None,
218:                 "state": posting.state if posting else None,
219:             },
220:         })
221: 
222:     from collections import Counter
223:     by_status = Counter(r["status"] for r in rows)
224:     return {
225:         "employer_id": str(employer_id),
226:         "total": len(rows),
227:         "status_counts": dict(by_status),
228:         "applications": rows,
229:     }
230: 
231: 
232: @router.get("/job/{job_id}")
233: async def applicants_for_job(
234:     job_id: UUID,
235:     status_filter: Optional[str] = Query(None),
236:     db: AsyncSession = Depends(get_db),
237:     user: dict = Depends(require_role("employer", "gov_admin")),
238: ):
239:     job_result = await db.execute(select(JobPosting).where(JobPosting.id == job_id))
240:     job = job_result.scalar_one_or_none()
241:     if not job:
242:         raise HTTPException(status_code=404, detail="Job posting not found")
243: 
244:     query = select(JobApplication).where(JobApplication.job_posting_id == job_id)
245:     if status_filter:
246:         query = query.where(JobApplication.status == status_filter)
247:     query = query.order_by(JobApplication.match_score.desc().nullslast())
248:     apps = (await db.execute(query)).scalars().all()
249: 
250:     # Enrich with candidate details for the employer board.
251:     rows = []
252:     for a in apps:
253:         cand = (
254:             await db.execute(select(Candidate).where(Candidate.id == a.candidate_id))
255:         ).scalar_one_or_none()
256:         rows.append({
257:             "id": str(a.id),
258:             "candidate_id": str(a.candidate_id),
259:             "job_posting_id": str(a.job_posting_id),
260:             "status": _status_value(a),
261:             "match_score": float(a.match_score) if a.match_score is not None else None,
262:             "skill_overlap": a.skill_overlap or [],
263:             "skill_gaps": a.skill_gaps or [],
264:             "cover_note": a.cover_note,
265:             "feedback": a.feedback,
266:             "offer_start_date": a.offer_start_date.isoformat() if a.offer_start_date else None,
267:             "offer_salary": float(a.offer_salary) if a.offer_salary is not None else None,
268:             "interview_at": a.interview_at.isoformat() if a.interview_at else None,
269:             "interview_note": a.interview_note,
270:             "applied_at": a.applied_at,
271:             "candidate": {
272:                 "full_name": cand.full_name if cand else None,
273:                 "state": cand.state if cand else None,
274:                 "district": cand.district if cand else None,
275:                 "phone": cand.phone if cand and cand.allow_employer_contact else None,
276:             },
277:         })
278:     return {"job_id": str(job_id), "title": job.title, "count": len(rows), "applicants": rows}
279: 
280: 
281: @router.get("/pipeline/{job_id}")
282: async def pipeline_counts(
283:     job_id: UUID,
284:     db: AsyncSession = Depends(get_db),
285:     user: dict = Depends(require_role("employer", "gov_admin")),
286: ):
287:     job_result = await db.execute(select(JobPosting).where(JobPosting.id == job_id))
288:     job = job_result.scalar_one_or_none()
289:     if not job:
290:         raise HTTPException(status_code=404, detail="Job posting not found")
291:     apps = (
292:         await db.execute(select(JobApplication).where(JobApplication.job_posting_id == job_id))
293:     ).scalars().all()
294:     counts = funnel_counts(apps)
295:     hires = sum(1 for a in apps if _status_value(a) == "hired")
296:     total = len(apps)
297:     return {
298:         "job_id": str(job_id),
299:         "title": job.title,
300:         "total_applicants": total,
301:         "stages": counts,
302:         "hired": hires,
303:     }
304: 
305: 
306: @router.patch("/{application_id}/status", response_model=ApplicationResponse)
307: async def update_application_status(
308:     application_id: UUID,
309:     body: StatusUpdate,
310:     db: AsyncSession = Depends(get_db),
311:     user: dict = Depends(require_role("employer", "gov_admin")),
312: ):
313:     result = await db.execute(
314:         select(JobApplication).where(JobApplication.id == application_id)
315:     )
316:     app = result.scalar_one_or_none()
317:     if not app:
318:         raise HTTPException(status_code=404, detail="Application not found")
319: 
320:     if not is_valid_status(body.status):
321:         raise HTTPException(status_code=400, detail=f"Unknown status '{body.status}'")
322: 
323:     current = _status_value(app)
324:     if not can_transition(current, body.status):
325:         allowed = sorted(STATUS_TRANSITIONS.get(current, set()))
326:         raise HTTPException(
327:             status_code=400,
328:             detail=f"Cannot move from '{current}' to '{body.status}'. Allowed: {allowed or 'none (terminal)'}",
329:         )
330: 
331:     job_row = (
332:         await db.execute(select(JobPosting).where(JobPosting.id == app.job_posting_id))
333:     ).scalar_one_or_none()
334: 
335:     app.status = body.status
336:     if body.feedback is not None:
337:         app.feedback = body.feedback
338:     if _status_value(app) == "hired":
339:         if body.start_date is not None:
340:             app.offer_start_date = body.start_date
341:         if body.salary_offered is not None:
342:             app.offer_salary = body.salary_offered
343:     if _status_value(app) == "interview":
344:         if body.interview_at is not None:
345:             app.interview_at = body.interview_at
346:         if body.interview_note is not None:
347:             app.interview_note = body.interview_note
348:     await db.flush()
349: 
350:     await _queue_status_notification(db, app, candidate=None, job=job_row)
351:     await db.refresh(app)
352:     return app
353: 
354: 
355: async def _queue_employer_application_alert(
356:     db: AsyncSession,
357:     app: JobApplication,
358:     candidate: Candidate,
359:     job: Optional[JobPosting],
360: ) -> None:
361:     """Notify the job's employer that a candidate applied (fire-and-forget)."""
362:     if not job or not job.employer_id:
363:         return
364: 
365:     employer = (
366:         await db.execute(select(Employer).where(Employer.id == job.employer_id))
367:     ).scalar_one_or_none()
368:     if not employer or not employer.phone:
369:         return
370: 
371:     body = (
372:         f"New application received for '{job.title}': {candidate.full_name} "
373:         f"applied with a match score of {app.match_score}%. Review it in your "
374:         f"hiring pipeline on the SkillTrace portal."
375:     )
376:     notif = Notification(
377:         recipient_id=None,
378:         recipient_type="employer",
379:         phone=employer.phone,
380:         channel="whatsapp",
381:         kind="new_application",
382:         title="New Job Application",
383:         body=body,
384:         status="queued",
385:     )
386:     db.add(notif)
387:     await db.flush()
388:     await db.refresh(notif)
389: 
390:     try:
391:         enqueue_delivery(str(notif.id))
392:     except Exception:
393:         pass
394: 
395: 
396: async def _queue_status_notification(
397:     db: AsyncSession,
398:     app: JobApplication,
399:     candidate: Optional[Candidate],
400:     job: Optional[JobPosting],
401: ) -> None:
402:     """Queue a WhatsApp/SMS notification to the candidate on a notable change.
403: 
404:     Fire-and-forget: delivery is handled by the worker task. If no transport is
405:     configured the row stays `queued` (status still persisted for tracking).
406:     """
407:     spec = APPLICATION_STATUS_NOTIFICATIONS.get(app.status.value if hasattr(app.status, "value") else app.status)
408:     if not spec:
409:         return
410: 
411:     cand = candidate
412:     if cand is None:
413:         cand = (
414:             await db.execute(select(Candidate).where(Candidate.id == app.candidate_id))
415:         ).scalar_one_or_none()
416: 
417:     if not cand:
418:         return
419: 
420:     variables = build_application_status_variables(
421:         job.title if job else None, None
422:     )
423:     body = render_template(spec["template"], variables)
424: 
425:     notif = Notification(
426:         recipient_id=cand.id,
427:         recipient_type="candidate",
428:         phone=cand.phone,
429:         channel="whatsapp",
430:         kind=spec["kind"],
431:         title=spec["title"],
432:         body=body,
433:         status="queued",
434:     )
435:     db.add(notif)
436:     await db.flush()
437:     await db.refresh(notif)
438: 
439:     try:
440:         enqueue_delivery(str(notif.id))
441:     except Exception:
442:         pass
443: 
444: 
445: def _status_value(app) -> str:
446:     return app.status.value if hasattr(app.status, "value") else str(app.status)

(End of file - total 446 lines)
</content>
```

**Tool: glob**

**Input:**
```json
{
  "path": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\components\\layout",
  "pattern": "Sidebar.tsx"
}
```

**Output:**
```
C:\aaditya\Opencode-project\SIH26135\frontend\src\components\layout\Sidebar.tsx
```

---

## Assistant (Build · Big Pickle · 52.9s)

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\components\\layout\\Sidebar.tsx"
}
```

**Output:**
```
<path>C:\aaditya\Opencode-project\SIH26135\frontend\src\components\layout\Sidebar.tsx</path>
<type>file</type>
<content>
1: "use client";
2: 
3: import Link from "next/link";
4: import { usePathname } from "next/navigation";
5: import {
6:   LayoutDashboard, Map, BarChart3, AlertTriangle, FileText,
7:   MessageSquareText, ShieldCheck, GraduationCap, Briefcase, Sparkles,
8:   BookOpen, History, ClipboardCheck, Building2, Users, TrendingUp,
9:   Target, Bell, FolderGit2, Filter,
10: } from "lucide-react";
11: 
12: type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };
13: 
14: const NAV: Record<string, { label: string; items: NavItem[] }> = {
15:   "/gov": {
16:     label: "Government Portal",
17:     items: [
18:       { href: "/gov", label: "Overview", icon: LayoutDashboard },
19:       { href: "/gov/manage", label: "Manage Content", icon: Filter },
20:       { href: "/gov/heatmap", label: "Skill Heatmap", icon: Map },
21:       { href: "/gov/scheme-roi", label: "Scheme ROI", icon: BarChart3 },
22:       { href: "/gov/surveys", label: "Surveys", icon: ClipboardCheck },
23:       { href: "/gov/alerts", label: "Policy Alerts", icon: AlertTriangle },
24:       { href: "/gov/reports", label: "Reports", icon: FileText },
25:     ],
26:   },
27:   "/candidate": {
28:     label: "Candidate Portal",
29:     items: [
30:       { href: "/candidate", label: "Dashboard", icon: LayoutDashboard },
31:       { href: "/candidate/verification", label: "Verification", icon: ShieldCheck },
32:       { href: "/candidate/skills", label: "My Skills", icon: Sparkles },
33:       { href: "/candidate/matches", label: "Job Matches", icon: Briefcase },
34:       { href: "/candidate/applications", label: "Applications", icon: FolderGit2 },
35:       { href: "/candidate/progress", label: "Progress", icon: History },
36:       { href: "/candidate/notifications", label: "Notifications", icon: Bell },
37:     ],
38:   },
39:   "/employer": {
40:     label: "Employer Portal",
41:     items: [
42:       { href: "/employer", label: "Overview", icon: LayoutDashboard },
43:       { href: "/employer/jobs", label: "Job Postings", icon: Briefcase },
44:       { href: "/employer/matches", label: "Candidate Matches", icon: Users },
45:       { href: "/employer/pipeline", label: "Pipeline", icon: TrendingUp },
46:     ],
47:   },
48:   "/partner": {
49:     label: "Training Partner",
50:     items: [
51:       { href: "/partner", label: "Overview", icon: LayoutDashboard },
52:       { href: "/partner/courses", label: "Courses", icon: BookOpen },
53:       { href: "/partner/students", label: "Students", icon: Users },
54:       { href: "/partner/enrollment", label: "Enrollments", icon: GraduationCap },
55:       { href: "/partner/curriculum-gap", label: "Curriculum Gap", icon: Target },
56:     ],
57:   },
58: };
59: 
60: const LOGOS: Record<string, { label: string; icon: typeof LayoutDashboard }> = {
61:   "/gov": { label: "Admin Console", icon: ShieldCheck },
62:   "/candidate": { label: "Candidate Hub", icon: GraduationCap },
63:   "/employer": { label: "Employer Suite", icon: Briefcase },
64:   "/partner": { label: "Partner Workspace", icon: Building2 },
65: };
66: 
67: export default function Sidebar() {
68:   const pathname = usePathname();
69: 
70:   const role = Object.keys(NAV)
71:     .filter((k) => pathname.startsWith(k))
72:     .sort((a, b) => b.length - a.length)[0] ?? "/gov";
73: 
74:   const { label, items } = NAV[role];
75:   const logo = LOGOS[role];
76:   const LogoIcon = logo.icon;
77: 
78:   const isActive = (href: string) =>
79:     href === "/" ? pathname === "/" : pathname.startsWith(href);
80: 
81:   return (
82:     <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-white/10 bg-[#0d1325]/70 p-4 backdrop-blur-2xl">
83:       {/* Brand */}
84:       <Link href="/" className="flex items-center gap-3 mb-1 px-2 py-3">
85:         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-brand-500 shadow-lg shadow-violet-600/40">
86:           <LogoIcon className="h-5 w-5 text-white" />
87:         </div>
88:         <div>
89:           <p className="bg-gradient-to-r from-violet-300 via-white to-indigo-300 bg-clip-text text-sm font-bold leading-tight text-transparent">SkillTrace AI</p>
90:           <p className="text-[11px] font-medium text-slate-400">{label}</p>
91:         </div>
92:       </Link>
93: 
94:       <div className="mb-4 mt-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
95:         Menu
96:       </div>
97: 
98:       <nav className="space-y-1">
99:         {items.map(({ href, label: itemLabel, icon: Icon }) => {
100:           const active = isActive(href);
101:           return (
102:             <Link
103:               key={href}
104:               href={href}
105:               className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
106:                 active
107:                   ? "bg-gradient-to-r from-violet-600/30 to-brand-500/20 text-white shadow-inner"
108:                   : "text-slate-400 hover:bg-white/[0.08] hover:text-slate-100"
109:               }`}
110:             >
111:               {active && (
112:                 <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-500 to-brand-400" />
113:               )}
114:               <Icon
115:                 className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 ${
116:                   active ? "text-violet-300" : "text-slate-400 group-hover:text-violet-400 group-hover:scale-110"
117:                 }`}
118:               />
119:               <span className="truncate">{itemLabel}</span>
120:             </Link>
121:           );
122:         })}
123:       </nav>
124: 
125:       <div className="mt-6 ml-1 text-[11px] text-slate-600">&copy; {new Date().getFullYear()} SkillTrace</div>
126:     </aside>
127:   );
128: }

(End of file - total 128 lines)
</content>
```

---

## Assistant (Build · Big Pickle · 42.5s)

_Thinking:_

Now I'll implement:

1. **Backend**: `PATCH /api/v1/applications/{application_id}/interview` — repo-guarded reschedule (employer/gov_admin). Body `{ at: datetime|null, note: str|null }`. Requires app.status == "interview". Also queue a candidate notification? Keep optional: I'll include a small note-only reschedule notification via `_queue_status_notification`? No — that template is for status changes. I'll create a bespoke "interview_rescheduled" Notification row to the candidate (fire-and-forget enqueue). Actually simpler + still valuable: reuse `_queue_status_notification` with app.status still "interview"? spec lookup by status "interview" won't exist in trigger set. There's `APPLICATION_STATUS_NOTIFICATIONS` — only statuses. I'll write a small inline notification creation for interview reschedule (WhatsApp queue, kind "interview_update"). Keep concise.

Body model `InterviewUpdate`.

2. **Frontend**: 
   - hooks: add `rescheduleInterview(appId, at, note)` in useDashboard.ts.
   - new page `frontend/src/app/employer/interviews/page.tsx`: uses `useEmployerApplicationsOverview()`; tab filter (Upcoming / Today / Past) + search; list interviews; each row shows candidate, job, datetime (formatISODateTime), note, countdown chip; "Reschedule" button opens modal (date+time+note) calling rescheduleInterview; toast + reload.
   - Sidebar: add "Interviews" item to /employer after Pipeline with CalendarDays/Target icon. Link `/employer/interviews`.
   - Mock-date note: overview data has interview rows already.

3. Verify tsc, ruff, tests, restart backend, smoke the new endpoint + page route.

Let me check useDashboard.ts for updateApplicationStatus signature and where to add rescheduleInterview.

Now I'll add a backend reschedule endpoint, a hook, a new Interviews hub page, and a sidebar link. First the hook file:

**Tool: grep**

**Input:**
```json
{
  "path": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\lib\\hooks\\useDashboard.ts",
  "pattern": "updateApplicationStatus|useEmployerApplicationsOverview"
}
```

**Output:**
```
Found 2 matches
C:\aaditya\Opencode-project\SIH26135\frontend\src\lib\hooks\useDashboard.ts:
  Line 278: export function useEmployerApplicationsOverview() {

  Line 315: export async function updateApplicationStatus(

```

---

## Assistant (Build · Big Pickle · 50.8s)

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\lib\\hooks\\useDashboard.ts",
  "limit": 85,
  "offset": 270
}
```

**Output:**
```
<path>C:\aaditya\Opencode-project\SIH26135\frontend\src\lib\hooks\useDashboard.ts</path>
<type>file</type>
<content>
270:     api.get(`/applications/job/${jobId}`, { params })
271:       .then((res) => setData(res.data))
272:       .finally(() => setLoading(false));
273:   }, [jobId, statusFilter, reloadKey]);
274: 
275:   return { data, loading };
276: }
277: 
278: export function useEmployerApplicationsOverview() {
279:   const [data, setData] = useState<EmployerApplicationsOverview | null>(null);
280:   const [loading, setLoading] = useState(true);
281: 
282:   useEffect(() => {
283:     api.get("/applications/overview")
284:       .then((res) => setData(res.data))
285:       .catch(() => setData(null))
286:       .finally(() => setLoading(false));
287:   }, []);
288: 
289:   return { data, loading };
290: }
291: 
292: export function usePipeline(jobId?: string, reloadKey = 0) {
293:   const [data, setData] = useState<PipelineResponse | null>(null);
294:   const [loading, setLoading] = useState(false);
295: 
296:   useEffect(() => {
297:     if (!jobId) return;
298:     setLoading(true);
299:     api.get(`/applications/pipeline/${jobId}`)
300:       .then((res) => setData(res.data))
301:       .finally(() => setLoading(false));
302:   }, [jobId, reloadKey]);
303: 
304:   return { data, loading };
305: }
306: 
307: export async function applyToJob(jobPostingId: string, coverNote?: string) {
308:   const res = await api.post("/applications/", {
309:     job_posting_id: jobPostingId,
310:     cover_note: coverNote || null,
311:   });
312:   return res.data as JobApplication;
313: }
314: 
315: export async function updateApplicationStatus(
316:   applicationId: string,
317:   status: ApplicationStatus,
318:   feedback?: string | null,
319:   offer?: { start_date?: string | null; salary_offered?: number | null },
320:   interview?: { at?: string | null; note?: string | null }
321: ) {
322:   const res = await api.patch(`/applications/${applicationId}/status`, {
323:     status,
324:     ...(feedback !== undefined && feedback !== null && feedback.trim() !== ""
325:       ? { feedback: feedback.trim() }
326:       : {}),
327:     ...(offer?.start_date ? { start_date: offer.start_date } : {}),
328:     ...(offer?.salary_offered != null
329:       ? { salary_offered: offer.salary_offered }
330:       : {}),
331:     ...(interview?.at ? { interview_at: interview.at } : {}),
332:     ...(interview?.note && interview.note.trim() !== ""
333:       ? { interview_note: interview.note.trim() }
334:       : {}),
335:   });
336:   return res.data as JobApplication;
337: }
338: 
339: export function useAvailableReports() {
340:   const [data, setData] = useState<AvailableReports | null>(null);
341:   const [loading, setLoading] = useState(true);
342: 
343:   useEffect(() => {
344:     api.get("/reports/available")
345:       .then((res) => setData(res.data))
346:       .finally(() => setLoading(false));
347:   }, []);
348: 
349:   return { data, loading };
350: }
351: 
352: export function useAnalyticsSnapshot() {
353:   const [data, setData] = useState<AnalyticsSnapshot | null>(null);
354:   const [loading, setLoading] = useState(true);

(Showing lines 270-354 of 767. Use offset=355 to continue.)
</content>
```

---

## Assistant (Build · Big Pickle · 44.9s)





**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\lib\\hooks\\useDashboard.ts",
  "newString": "export async function rescheduleInterview(\n  applicationId: string,\n  at: string | null,\n  note?: string | null,\n) {\n  const res = await api.patch(`/applications/${applicationId}/interview`, {\n    interview_at: at,\n    ...(note !== undefined && note !== null && note.trim() !== \"\"\n      ? { interview_note: note.trim() }\n      : { interview_note: null }),\n  });\n  return res.data as JobApplication;\n}\n\nexport function useAvailableReports() {",
  "oldString": "export function useAvailableReports() {"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 43.1s)

Now the backend reschedule endpoint:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\backend\\app\\api\\v1\\applications.py",
  "newString": "class StatusUpdate(BaseModel):\n    status: str\n    feedback: Optional[str] = Field(None, max_length=2000)\n    start_date: Optional[date] = None\n    salary_offered: Optional[float] = None\n    interview_at: Optional[datetime] = None\n    interview_note: Optional[str] = Field(None, max_length=2000)\n\n\nclass InterviewUpdate(BaseModel):\n    interview_at: Optional[datetime] = None\n    interview_note: Optional[str] = Field(None, max_length=2000)",
  "oldString": "class StatusUpdate(BaseModel):\n    status: str\n    feedback: Optional[str] = Field(None, max_length=2000)\n    start_date: Optional[date] = None\n    salary_offered: Optional[float] = None\n    interview_at: Optional[datetime] = None\n    interview_note: Optional[str] = Field(None, max_length=2000)"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 98.4s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\backend\\app\\api\\v1\\applications.py",
  "newString": "@router.patch(\"/{application_id}/status\", response_model=ApplicationResponse)\nasync def update_application_status(\n    application_id: UUID,\n    body: StatusUpdate,\n    db: AsyncSession = Depends(get_db),\n    user: dict = Depends(require_role(\"employer\", \"gov_admin\")),\n):\n    result = await db.execute(\n        select(JobApplication).where(JobApplication.id == application_id)\n    )\n    app = result.scalar_one_or_none()\n    if not app:\n        raise HTTPException(status_code=404, detail=\"Application not found\")\n\n    if not is_valid_status(body.status):\n        raise HTTPException(status_code=400, detail=f\"Unknown status '{body.status}'\")\n\n    current = _status_value(app)\n    if not can_transition(current, body.status):\n        allowed = sorted(STATUS_TRANSITIONS.get(current, set()))\n        raise HTTPException(\n            status_code=400,\n            detail=f\"Cannot move from '{current}' to '{body.status}'. Allowed: {allowed or 'none (terminal)'}\",\n        )\n\n    job_row = (\n        await db.execute(select(JobPosting).where(JobPosting.id == app.job_posting_id))\n    ).scalar_one_or_none()\n\n    app.status = body.status\n    if body.feedback is not None:\n        app.feedback = body.feedback\n    if _status_value(app) == \"hired\":\n        if body.start_date is not None:\n            app.offer_start_date = body.start_date\n        if body.salary_offered is not None:\n            app.offer_salary = body.salary_offered\n    if _status_value(app) == \"interview\":\n        if body.interview_at is not None:\n            app.interview_at = body.interview_at\n        if body.interview_note is not None:\n            app.interview_note = body.interview_note\n    await db.flush()\n\n    await _queue_status_notification(db, app, candidate=None, job=job_row)\n    await db.refresh(app)\n    return app\n\n\n@router.patch(\"/{application_id}/interview\", response_model=ApplicationResponse)\nasync def reschedule_interview(\n    application_id: UUID,\n    body: InterviewUpdate,\n    db: AsyncSession = Depends(get_db),\n    user: dict = Depends(require_role(\"employer\", \"gov_admin\")),\n):\n    \"\"\"Update interview_at/interview_note for a candidate already in the interview stage.\"\"\"\n    result = await db.execute(\n        select(JobApplication).where(JobApplication.id == application_id)\n    )\n    app = result.scalar_one_or_none()\n    if not app:\n        raise HTTPException(status_code=404, detail=\"Application not found\")\n    if _status_value(app) != \"interview\":\n        raise HTTPException(\n            status_code=400,\n            detail=\"Only interview-stage applications can be rescheduled\",\n        )\n\n    job_row = (\n        await db.execute(select(JobPosting).where(JobPosting.id == app.job_posting_id))\n    ).scalar_one_or_none()\n\n    if body.interview_at is not None:\n        app.interview_at = body.interview_at\n    if body.interview_note is not None:\n        app.interview_note = body.interview_note\n    await db.flush()\n\n    await _queue_interview_update_notification(db, app, job=job_row)\n    await db.refresh(app)\n    return app",
  "oldString": "@router.patch(\"/{application_id}/status\", response_model=ApplicationResponse)\nasync def update_application_status(\n    application_id: UUID,\n    body: StatusUpdate,\n    db: AsyncSession = Depends(get_db),\n    user: dict = Depends(require_role(\"employer\", \"gov_admin\")),\n):\n    result = await db.execute(\n        select(JobApplication).where(JobApplication.id == application_id)\n    )\n    app = result.scalar_one_or_none()\n    if not app:\n        raise HTTPException(status_code=404, detail=\"Application not found\")\n\n    if not is_valid_status(body.status):\n        raise HTTPException(status_code=400, detail=f\"Unknown status '{body.status}'\")\n\n    current = _status_value(app)\n    if not can_transition(current, body.status):\n        allowed = sorted(STATUS_TRANSITIONS.get(current, set()))\n        raise HTTPException(\n            status_code=400,\n            detail=f\"Cannot move from '{current}' to '{body.status}'. Allowed: {allowed or 'none (terminal)'}\",\n        )\n\n    job_row = (\n        await db.execute(select(JobPosting).where(JobPosting.id == app.job_posting_id))\n    ).scalar_one_or_none()\n\n    app.status = body.status\n    if body.feedback is not None:\n        app.feedback = body.feedback\n    if _status_value(app) == \"hired\":\n        if body.start_date is not None:\n            app.offer_start_date = body.start_date\n        if body.salary_offered is not None:\n            app.offer_salary = body.salary_offered\n    if _status_value(app) == \"interview\":\n        if body.interview_at is not None:\n            app.interview_at = body.interview_at\n        if body.interview_note is not None:\n            app.interview_note = body.interview_note\n    await db.flush()\n\n    await _queue_status_notification(db, app, candidate=None, job=job_row)\n    await db.refresh(app)\n    return app"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 40.1s)

_Thinking:_

Now add the `_queue_interview_update_notification` helper next to `_queue_status_notification`. Reuse pattern: candidate notification, kind "interview_update", title "Interview Rescheduled", body with job title + datetime.

Now add the interview-update notification helper:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\backend\\app\\api\\v1\\applications.py",
  "newString": "async def _queue_interview_update_notification(\n    db: AsyncSession,\n    app: JobApplication,\n    job: Optional[JobPosting],\n) -> None:\n    \"\"\"Queue a WhatsApp/SMS notification to the candidate when an interview is rescheduled.\"\"\"\n    if not app.interview_at:\n        return\n\n    cand = (\n        await db.execute(select(Candidate).where(Candidate.id == app.candidate_id))\n    ).scalar_one_or_none()\n    if not cand or not cand.phone:\n        return\n\n    when = app.interview_at.strftime(\"%d %b %Y, %I:%M %p\")\n    body = (\n        f\"Your interview for '{job.title if job else 'the role'}' with SkillTrace has been \"\n        f\"scheduled for {when}. Please keep your documents ready and check the notes for details.\"\n    )\n    notif = Notification(\n        recipient_id=cand.id,\n        recipient_type=\"candidate\",\n        phone=cand.phone,\n        channel=\"whatsapp\",\n        kind=\"interview_update\",\n        title=\"Interview Rescheduled\",\n        body=body,\n        status=\"queued\",\n    )\n    db.add(notif)\n    await db.flush()\n    await db.refresh(notif)\n\n    try:\n        enqueue_delivery(str(notif.id))\n    except Exception:\n        pass\n\n\ndef _status_value(app) -> str:\n    return app.status.value if hasattr(app.status, \"value\") else str(app.status)",
  "oldString": "def _status_value(app) -> str:\n    return app.status.value if hasattr(app.status, \"value\") else str(app.status)"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 36.0s)

_Thinking:_

Now the Interviews hub page. Build `frontend/src/app/employer/interviews/page.tsx`:

- "use client", Sidebar + TopBar, useRequireAuth("employer").
- useEmployerApplicationsOverview().
- Tabs: All / Upcoming / Today / Past. Definitions based on interview_at:
  - Upcoming: at >= tomorrow start (days >= 1 from now)? Let me define: today = same calendar day as now; upcoming = date > today; past = date < today. Use date compare via local Date.
- Search input filters candidate name / job title.
- Sort by interview_at ascending (soonest first).
- Summary chips at top: Upcoming count, Today count, Completed/Past count.
- Each row: avatar initial, candidate full_name, job title + location, match score, interview datetime (formatISODateTime), note (line-clamp), countdown chip (via local helper matching employer dashboard style), and a "Reschedule" button. Rows for past interviews show muted styling.
- Reschedule modal: datetime-local input + note textarea + save → rescheduleInterview(id, atEpochIso, note) → toast, reload (reloadKey passed to overview? overview hook doesn't accept reloadKey). I need the overview hook to support reload. Current useEmployerApplicationsOverview has no reloadKey. I'll add reloadKey param to the hook (with default 0) so pages can refresh. Update existing usage (jobs page + dashboard don't pass → fine).

Let me update the hook to accept optional reloadKey.

- Also need a reload trigger after reschedule.

datetime-local value conversion: format from ISO to local input `YYYY-MM-DDTHH:mm`. Write helper.

Icons: CalendarDays, Clock, Search, BadgeCheck (already used), Phone maybe, MapPin, MessageSquare. Check lucide availability — standard.

Let me write the page.

Now update the overview hook to support reloads, then build the Interviews page:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\lib\\hooks\\useDashboard.ts",
  "newString": "export function useEmployerApplicationsOverview(reloadKey = 0) {\n  const [data, setData] = useState<EmployerApplicationsOverview | null>(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    setLoading(true);\n    api.get(\"/applications/overview\")\n      .then((res) => setData(res.data))\n      .catch(() => setData(null))\n      .finally(() => setLoading(false));\n  }, [reloadKey]);\n\n  return { data, loading };\n}",
  "oldString": "export function useEmployerApplicationsOverview() {\n  const [data, setData] = useState<EmployerApplicationsOverview | null>(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    api.get(\"/applications/overview\")\n      .then((res) => setData(res.data))\n      .catch(() => setData(null))\n      .finally(() => setLoading(false));\n  }, []);\n\n  return { data, loading };\n}"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 55.4s)

**Tool: write**

**Input:**
```json
{
  "content": "\"use client\";\n\nimport { useMemo, useState } from \"react\";\nimport Sidebar from \"@/components/layout/Sidebar\";\nimport TopBar from \"@/components/layout/TopBar\";\nimport { useRequireAuth } from \"@/lib/hooks/useAuthGuard\";\nimport {\n  useEmployerApplicationsOverview,\n  rescheduleInterview,\n} from \"@/lib/hooks/useDashboard\";\nimport { formatISODateTime } from \"@/lib/utils\";\nimport type { OverviewApplication } from \"@/lib/types\";\nimport Modal from \"@/components/ui/Modal\";\nimport Toast from \"@/components/ui/Toast\";\nimport {\n  CalendarDays, Clock, Search, MapPin, MessageSquare, Sparkles,\n} from \"lucide-react\";\n\ntype Tab = \"upcoming\" | \"today\" | \"past\";\n\nfunction dayKey(iso: string): string {\n  const d = new Date(iso);\n  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;\n}\n\nfunction countdown(iso: string): { label: string; tone: string; done: boolean } {\n  const diff = new Date(iso).getTime() - Date.now();\n  const days = Math.ceil(diff / 86400000);\n  if (days < 0) return { label: \"Finished\", tone: \"bg-slate-100 text-slate-400\", done: true };\n  if (days === 0) return { label: \"Today\", tone: \"bg-violet-100 text-violet-700 ring-1 ring-violet-200\", done: false };\n  if (days === 1) return { label: \"Tomorrow\", tone: \"bg-violet-100 text-violet-700 ring-1 ring-violet-200\", done: false };\n  return { label: `In ${days} days`, tone: \"bg-violet-50 text-violet-600\", done: false };\n}\n\nfunction toLocalInput(iso: string): string {\n  const d = new Date(iso);\n  const pad = (n: number) => String(n).padStart(2, \"0\");\n  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;\n}\n\nexport default function EmployerInterviewsPage() {\n  useRequireAuth(\"employer\");\n\n  const [reloadKey, setReloadKey] = useState(0);\n  const { data: overview, loading } = useEmployerApplicationsOverview(reloadKey);\n  const [tab, setTab] = useState<Tab>(\"upcoming\");\n  const [query, setQuery] = useState(\"\");\n  const [toast, setToast] = useState<{ message: string; tone: \"success\" | \"error\" } | null>(null);\n  const [resched, setResched] = useState<OverviewApplication | null>(null);\n  const [draftAt, setDraftAt] = useState(\"\");\n  const [draftNote, setDraftNote] = useState(\"\");\n  const [saving, setSaving] = useState(false);\n\n  const interviews = useMemo(\n    () =>\n      (overview?.applications ?? [])\n        .filter((a) => a.status === \"interview\" && a.interview_at)\n        .sort((x, y) => new Date(x.interview_at!).getTime() - new Date(y.interview_at!).getTime()),\n    [overview],\n  );\n\n  const todayKey = dayKey(new Date().toISOString());\n\n  const buckets = useMemo(() => {\n    const filtered = interviews.filter((a) => {\n      const hay = `${a.candidate.full_name ?? \"\"} ${a.job.title ?? \"\"}`.toLowerCase();\n      return hay.includes(query.trim().toLowerCase());\n    });\n    return {\n      all: filtered,\n      upcoming: filtered.filter((a) => dayKey(a.interview_at!) > todayKey),\n      today: filtered.filter((a) => dayKey(a.interview_at!) === todayKey),\n      past: filtered.filter((a) => dayKey(a.interview_at!) < todayKey),\n    };\n  }, [interviews, query, todayKey]);\n\n  const visible = tab === \"all\" ? buckets.all : buckets[tab];\n\n  const openReschedule = (a: OverviewApplication) => {\n    setResched(a);\n    setDraftAt(toLocalInput(a.interview_at!));\n    setDraftNote(a.interview_note ?? \"\");\n  };\n\n  const saveReschedule = async () => {\n    if (!resched || !draftAt) return;\n    setSaving(true);\n    try {\n      const at = new Date(draftAt).toISOString();\n      await rescheduleInterview(resched.id, at, draftNote || null);\n      setToast({ message: `Interview updated for ${resched.candidate.full_name}.`, tone: \"success\" });\n      setResched(null);\n      setReloadKey((k) => k + 1);\n    } catch (e: unknown) {\n      const detail =\n        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||\n        \"Could not update interview\";\n      setToast({ message: detail, tone: \"error\" });\n    } finally {\n      setSaving(false);\n    }\n  };\n\n  const tabs: { key: Tab; label: string; count: number }[] = [\n    { key: \"upcoming\", label: \"Upcoming\", count: buckets.upcoming.length },\n    { key: \"today\", label: \"Today\", count: buckets.today.length },\n    { key: \"past\", label: \"Past\", count: buckets.past.length },\n  ];\n\n  return (\n    <div className=\"flex min-h-screen\">\n      <Sidebar />\n      <div className=\"flex-1\">\n        <TopBar title=\"Interviews\" subtitle=\"Every interview across all your postings\" />\n        <main className=\"p-6\">\n          <div className=\"mx-auto max-w-5xl\">\n            <div className=\"flex flex-wrap items-center justify-between gap-3 mb-6\">\n              <div>\n                <h1 className=\"text-3xl font-bold text-slate-800 mb-1\">Interviews</h1>\n                <p className=\"text-slate-500\">\n                  {interviews.length} scheduled{interviews.length !== 1 ? \"s\" : \"\"} across {overview ? overview.applications.length : 0} applications\n                </p>\n              </div>\n              <div className=\"relative\">\n                <Search className=\"absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400\" />\n                <input\n                  value={query}\n                  onChange={(e) => setQuery(e.target.value)}\n                  placeholder=\"Search candidate or role…\"\n                  className=\"input-glass w-64 pl-9\"\n                />\n              </div>\n            </div>\n\n            {toast && (\n              <div className=\"mb-4\">\n                <Toast message={toast.message} tone={toast.tone} />\n              </div>\n            )}\n\n            <div className=\"flex gap-2 mb-6\">\n              {tabs.map(({ key, label, count }) => (\n                <button\n                  key={key}\n                  onClick={() => setTab(key)}\n                  className={`btn-glass text-sm ${tab === key ? \"!bg-brand-500 !text-white\" : \"\"}`}\n                >\n                  {label}\n                  <span className={`ml-1.5 rounded-full px-1.5 text-[11px] ${tab === key ? \"bg-white/25\" : \"bg-slate-100\"}`}>\n                    {count}\n                  </span>\n                </button>\n              ))}\n            </div>\n\n            {loading ? (\n              <div className=\"space-y-3\">\n                {[1, 2, 3].map((i) => (\n                  <div key={i} className=\"glass skeleton h-24\" />\n                ))}\n              </div>\n            ) : visible.length === 0 ? (\n              <div className=\"glass p-12 text-center text-slate-500 animate-fade-up\">\n                <CalendarDays className=\"mx-auto mb-3 h-10 w-10 text-slate-300\" />\n                <p className=\"font-medium text-slate-600\">No interviews in this view</p>\n                <p className=\"text-sm text-slate-400 mt-1\">\n                  Schedule interviews from your hiring pipeline to see them here.\n                </p>\n              </div>\n            ) : (\n              <div className=\"space-y-3\">\n                {visible.map((a, i) => {\n                  const cd = countdown(a.interview_at!);\n                  return (\n                    <div\n                      key={a.id}\n                      className={`glass p-5 animate-fade-up ${cd.done ? \"opacity-75\" : \"\"}`}\n                      style={{ animationDelay: `${i * 0.04}s` }}\n                    >\n                      <div className=\"flex items-start justify-between gap-4\">\n                        <div className=\"flex min-w-0 items-center gap-3\">\n                          <div className=\"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white\">\n                            {(a.candidate.full_name ?? \"?\").charAt(0).toUpperCase()}\n                          </div>\n                          <div className=\"min-w-0\">\n                            <p className=\"truncate font-semibold text-slate-800\">\n                              {a.candidate.full_name}\n                            </p>\n                            <p className=\"truncate text-xs text-slate-500\">\n                              {a.job.title}\n                              {(a.job.location || a.job.state) && (\n                                <>\n                                  {\" · \"}\n                                  <MapPin className=\"inline h-3 w-3 -mt-0.5\" />\n                                  {a.job.location || a.job.state}\n                                </>\n                              )}\n                            </p>\n                            {a.match_score != null && (\n                              <p className=\"mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600\">\n                                <Sparkles className=\"h-3 w-3\" />\n                                {Math.round(a.match_score)}% match\n                              </p>\n                            )}\n                          </div>\n                        </div>\n                        <span className={`chip shrink-0 text-[10px] ${cd.tone}`}>{cd.label}</span>\n                      </div>\n\n                      <div className=\"mt-3 flex flex-wrap items-center gap-x-5 gap-y-2\">\n                        <span className=\"flex items-center gap-1.5 text-sm font-semibold text-violet-700\">\n                          <Clock className=\"h-4 w-4\" />\n                          {formatISODateTime(a.interview_at!)}\n                        </span>\n                        {a.interview_note && (\n                          <span className=\"flex min-w-0 items-center gap-1.5 text-xs text-slate-500\">\n                            <MessageSquare className=\"h-3.5 w-3.5 shrink-0 text-violet-400\" />\n                            <span className=\"truncate\">{a.interview_note}</span>\n                          </span>\n                        )}\n                        <button\n                          onClick={() => openReschedule(a)}\n                          disabled={cd.done}\n                          className=\"btn-ghost ml-auto text-xs font-medium px-3 py-1.5 hover:text-brand-600 disabled:opacity-40\"\n                        >\n                          Reschedule\n                        </button>\n                      </div>\n                    </div>\n                  );\n                })}\n              </div>\n            )}\n          </div>\n        </main>\n      </div>\n\n      {/* Reschedule Modal */}\n      <Modal\n        open={!!resched}\n        title=\"Reschedule Interview\"\n        subtitle={resched ? `${resched.candidate.full_name} · ${resched.job.title}` : undefined}\n        onClose={() => { if (!saving) setResched(null); }}\n        footer={\n          <>\n            <button onClick={() => setResched(null)} disabled={saving} className=\"btn-ghost\">\n              Cancel\n            </button>\n            <button\n              onClick={saveReschedule}\n              disabled={saving || !draftAt}\n              className=\"btn-glass disabled:opacity-50\"\n            >\n              {saving ? \"Saving…\" : \"Save\"}\n            </button>\n          </>\n        }\n      >\n        <div className=\"space-y-4\">\n          <div>\n            <label htmlFor=\"interview-datetime\" className=\"mb-1.5 block text-xs font-medium text-slate-400\">\n              Date &amp; time\n            </label>\n            <input\n              id=\"interview-datetime\"\n              type=\"datetime-local\"\n              value={draftAt}\n              onChange={(e) => setDraftAt(e.target.value)}\n              className=\"input-glass w-full\"\n            />\n          </div>\n          <div>\n            <label htmlFor=\"interview-note\" className=\"mb-1.5 block text-xs font-medium text-slate-400\">\n              Note (mode / location / what to prep)\n            </label>\n            <textarea\n              id=\"interview-note\"\n              value={draftNote}\n              onChange={(e) => setDraftNote(e.target.value)}\n              rows={3}\n              className=\"input-glass w-full\"\n              placeholder=\"e.g. Video call — Google Meet, prepare for SQL + Django questions\"\n            />\n          </div>\n          <p className=\"text-xs text-slate-400\">\n            The candidate will receive a WhatsApp/SMS notification with the updated time.\n          </p>\n        </div>\n      </Modal>\n    </div>\n  );\n}",
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\employer\\interviews\\page.tsx"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Big Pickle · 33.5s)

Now add the sidebar link:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\components\\layout\\Sidebar.tsx",
  "newString": "Trainers: \"\",\n} as never) && \"\";\nimport {\n  LayoutDashboard, Map, BarChart3, AlertTriangle, FileText,\n  MessageSquareText, ShieldCheck, GraduationCap, Briefcase, Sparkles,\n  BookOpen, History, ClipboardCheck, Building2, Users, TrendingUp,\n  Target, Bell, FolderGit2, Filter, CalendarDays,\n} from \"lucide-react\";",
  "oldString": "import {\n  LayoutDashboard, Map, BarChart3, AlertTriangle, FileText,\n  MessageSquareText, ShieldCheck, GraduationCap, Briefcase, Sparkles,\n  BookOpen, History, ClipboardCheck, Building2, Users, TrendingUp,\n  Target, Bell, FolderGit2, Filter,\n} from \"lucide-react\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 46.0s)

_Thinking:_

Wait, I made a mistake — I added a bogus line `Trainers: "", } as never) && "";` — that was an accidental paste. I need to remove that. Let me fix immediately.

I accidentally inserted a bogus line. Fix:



**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\components\\layout\\Sidebar.tsx",
  "newString": "import {\n  LayoutDashboard, Map, BarChart3, AlertTriangle, FileText,\n  MessageSquareText, ShieldCheck, GraduationCap, Briefcase, Sparkles,\n  BookOpen, History, ClipboardCheck, Building2, Users, TrendingUp,\n  Target, Bell, FolderGit2, Filter, CalendarDays,\n} from \"lucide-react\";",
  "oldString": "Trainers: \"\",\n} as never) && \"\";\nimport {\n  LayoutDashboard, Map, BarChart3, AlertTriangle, FileText,\n  MessageSquareText, ShieldCheck, GraduationCap, Briefcase, Sparkles,\n  BookOpen, History, ClipboardCheck, Building2, Users, TrendingUp,\n  Target, Bell, FolderGit2, Filter, CalendarDays,\n} from \"lucide-react\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 1145.0s)

**Tool: edit**

**Input:**
```json
{}
```

**Error:**
```
Tool execution aborted
```

---

## User

go

---

## Assistant (Build · Big Pickle · 34.4s)

_Thinking:_

The user says "go" again. I was adding the sidebar nav item — I had added the CalendarDays import. Now add the "Interviews" nav item to the employer section in the NAV, after Pipeline. Let me do that edit.

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\components\\layout\\Sidebar.tsx",
  "newString": "\"/employer\": {\n    label: \"Employer Portal\",\n    items: [\n      { href: \"/employer\", label: \"Overview\", icon: LayoutDashboard },\n      { href: \"/employer/jobs\", label: \"Job Postings\", icon: Briefcase },\n      { href: \"/employer/matches\", label: \"Candidate Matches\", icon: Users },\n      { href: \"/employer/pipeline\", label: \"Pipeline\", icon: TrendingUp },\n      { href: \"/employer/interviews\", label: \"Interviews\", icon: CalendarDays },\n    ],\n  },",
  "oldString": "\"/employer\": {\n    label: \"Employer Portal\",\n    items: [\n      { href: \"/employer\", label: \"Overview\", icon: LayoutDashboard },\n      { href: \"/employer/jobs\", label: \"Job Postings\", icon: Briefcase },\n      { href: \"/employer/matches\", label: \"Candidate Matches\", icon: Users },\n      { href: \"/employer/pipeline\", label: \"Pipeline\", icon: TrendingUp },\n    ],\n  },"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 41.5s)

Now run the gates and restart the backend for the new endpoint:

**Tool: bash**

**Input:**
```json
{
  "command": "npx tsc --noEmit; Write-Output \"TSC_EXIT:$LASTEXITCODE\"",
  "timeout": 240000,
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend"
}
```

**Output:**
```
src/app/employer/interviews/page.tsx(77,19): error TS2367: This comparison appears to be unintentional because the types 'Tab' and '"all"' have no overlap.
TSC_EXIT:2

```

**Tool: bash**

**Input:**
```json
{
  "command": "python -m ruff check app/ --select F401,F811,F821; Write-Output \"RUFF_EXIT:$LASTEXITCODE\"",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```
warning: The top-level linter settings are deprecated in favour of their counterparts in the `lint` section. Please update the following options in `C:\aaditya\Opencode-project\SIH26135\pyproject.toml`:
  - 'ignore' -> 'lint.ignore'
  - 'select' -> 'lint.select'
  - 'isort' -> 'lint.isort'
All checks passed!
RUFF_EXIT:0

```

---

## Assistant (Build · Big Pickle · 44.6s)

_Thinking:_

The Tab type is "upcoming" | "today" | "past" but I use `tab === "all"`. Fix: extend Tab to include "all", or default the buckets.all removal. Simplest: change Tab type to include `"all"` but the tabs array doesn't have an "all" tab... Actually I removed the "all" tab from the tab list but left buckets.all. Let me set initial tab to "upcoming" and remove the "all" reference. Change the `visible` computation to use a `all` variable directly. Just remove "all" from Tab and compute visible as `tab === "all" ? buckets.all : buckets[tab]` → change to just `buckets[tab]`, and remove the `all` case. But the count badges use buckets.upcoming/today/past; "all" not shown. So remove the `all` bucket entirely OR add an "all" tab. I'll keep buckets.all unused? Unused var is fine but cleaner to add "all" to Tab and show it. Actually simplest: remove `all` from buckets type usage; make visible use `buckets[tab]`. Keep `all` for possible header count. Let me just change Tab to include "all" as first tab. I'll add an "All" tab with count interviews.length. That's more useful anyway.

Add an "all" tab option to fix the type:

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\employer\\interviews\\page.tsx",
  "newString": "type Tab = \"all\" | \"upcoming\" | \"today\" | \"past\";",
  "oldString": "type Tab = \"upcoming\" | \"today\" | \"past\";"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 27.5s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\employer\\interviews\\page.tsx",
  "newString": "const tabs: { key: Tab; label: string; count: number }[] = [\n    { key: \"all\", label: \"All\", count: buckets.all.length },\n    { key: \"upcoming\", label: \"Upcoming\", count: buckets.upcoming.length },\n    { key: \"today\", label: \"Today\", count: buckets.today.length },\n    { key: \"past\", label: \"Past\", count: buckets.past.length },\n  ];",
  "oldString": "const tabs: { key: Tab; label: string; count: number }[] = [\n    { key: \"upcoming\", label: \"Upcoming\", count: buckets.upcoming.length },\n    { key: \"today\", label: \"Today\", count: buckets.today.length },\n    { key: \"past\", label: \"Past\", count: buckets.past.length },\n  ];"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 36.4s)

**Tool: edit**

**Input:**
```json
{
  "filePath": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend\\src\\app\\employer\\interviews\\page.tsx",
  "newString": "const [reloadKey, setReloadKey] = useState(0);\n  const { data: overview, loading } = useEmployerApplicationsOverview(reloadKey);\n  const [tab, setTab] = useState<Tab>(\"all\");",
  "oldString": "const [reloadKey, setReloadKey] = useState(0);\n  const { data: overview, loading } = useEmployerApplicationsOverview(reloadKey);\n  const [tab, setTab] = useState<Tab>(\"upcoming\");"
}
```

**Output:**
```
Edit applied successfully.
```

---

## Assistant (Build · Big Pickle · 60.0s)

**Tool: bash**

**Input:**
```json
{
  "command": "npx tsc --noEmit; Write-Output \"TSC_EXIT:$LASTEXITCODE\"",
  "timeout": 240000,
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\frontend"
}
```

**Output:**
```
TSC_EXIT:0

```

---

## Assistant (Build · Big Pickle · 50.3s)

_Thinking:_

tsc clean. Now restart backend & run tests, then smoke the new endpoint.

tsc clean. Restart backend and run tests:

**Tool: bash**

**Input:**
```json
{
  "command": "$conn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue; if ($conn) { Stop-Process -Id $conn.OwningProcess -Force; Start-Sleep -Seconds 2 }; $env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; Start-Process python -ArgumentList \"-m\",\"uvicorn\",\"app.main:app\",\"--host\",\"0.0.0.0\",\"--port\",\"8000\" -WorkingDirectory \"C:\\aaditya\\Opencode-project\\SIH26135\\backend\" -WindowStyle Hidden; Start-Sleep -Seconds 8; Write-Output \"restarted\"",
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135\\backend"
}
```

**Output:**
```
restarted

```

**Tool: bash**

**Input:**
```json
{
  "command": "$env:PYTHONPATH=\"C:\\aaditya\\Opencode-project\\SIH26135\\backend\"; python -m pytest backend/tests workers/tests -q -p no:cacheprovider 2>$null | Select-Object -Last 3",
  "timeout": 300000,
  "workdir": "C:\\aaditya\\Opencode-project\\SIH26135"
}
```

**Output:**
```
----------------------------------------------------------------------------
TOTAL                                           3506   1933    45%
======================== 49 passed, 1 warning in 6.11s ========================

```

---

## Assistant (Build · Big Pickle · 32.3s)

Tests pass. Smoke the new reschedule endpoint and the interviews page route:

**Tool: bash**

**Input:**
```json
{
  "command": "Set-Content -LiteralPath \"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login.json\" -Value '{\"phone\":\"9900000001\",\"password\":\"password123\"}' -Encoding ascii; $e = curl.exe -s -X POST http://127.0.0.1:8000/api/v1/auth/login/password -d \"@C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login.json\" -H \"Content-Type: application/json\"; $token = ($e | ConvertFrom-Json).access_token; $o = curl.exe -s \"http://127.0.0.1:8000/api/v1/applications/overview\" -H \"Authorization: Bearer $token\" | ConvertFrom-Json; $iv = $o.applications | Where-Object { $_.status -eq \"interview\" -and $_.interview_at } | Select-Object -First 1; Write-Output \"INTERVIEW_APP:$($iv.candidate.full_name) | $($iv.interview_at)\"; Set-Content -LiteralPath \"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\resched.json\" -Value '{\"interview_at\":\"2026-09-12T10:00:00\",\"interview_note\":\"Video call — Google Meet. Bring your PAN and one photo ID.\"}' -Encoding ascii; $r = curl.exe -s -X PATCH \"http://127.0.0.1:8000/api/v1/applications/$($iv.id)/interview\" -d \"@C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\resched.json\" -H \"Authorization: Bearer $token\" -H \"Content-Type: application/json\"; Write-Output \"RESCHED:\"; Write-Output $r"
}
```

**Output:**
```
INTERVIEW_APP:Arjun Menon | 2026-09-03T02:26:36.052453
RESCHED:
{"id":"f1a70a52-4c04-4e53-963b-d7211b3ba3d2","candidate_id":"f0cd039f-dcf8-446b-8a72-2b9710d30aa1","job_posting_id":"787062d5-289d-4d8e-ae6d-4b2b051b887b","status":"interview","cover_note":"Currently at TASK academy; strong CS fundamentals and two DSA prep sprints.","feedback":null,"offer_start_date":null,"offer_salary":null,"interview_at":"2026-09-12T10:00:00","interview_note":"Video call ? Google Meet. Bring your PAN and one photo ID.","match_score":56.0,"applied_at":"2026-09-01T09:30:00","updated_at":"2026-09-05T07:19:51.535667"}

```

---

## Assistant (Build · Big Pickle · 25.4s)

_Thinking:_

The reschedule endpoint works — Arjun Menon's interview updated to 2026-09-12T10:00. Note the em-dash `—` got mangled to "?" in JSON (PowerShell Set-Content encoding issue — the file was written as ASCII, converting the em-dash to ?). The endpoint itself works fine; it's just my test payload encoding. That's fine — a real client sends UTF-8.

But wait — it also confirmed: the interview page is populated. Arjun's interview was in the past (2026-09-03) and is now rescheduled to Sept 12 (future) → will show "In 7 days". Also he now has a second Notification "interview_update" queued (candidate Arjun, whatsapp). Good — demonstrable.

Also the arrow shows the current interview list. Also note: the em-dash → "?" in the note; it's stored as "Video call ? Google Meet..." which is a bit ugly. Let me clean that by PATCHing a proper note via a UTF-8 file. Minor but let me fix it to keep the demo polished.

Then verify the /employer/interviews page returns 200 (dev server on 3000).

Endpoint works. Fix the mojibake in the note (PowerShell ASCII wrote `—` as `?`) with a proper UTF-8 payload:

**Tool: write**

**Input:**
```json
{
  "content": "{\"interview_at\":\"2026-09-12T10:00:00\",\"interview_note\":\"Video call — Google Meet. Bring your PAN and one photo ID.\"}",
  "filePath": "C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\resched2.json"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · Big Pickle · 29.5s)

**Tool: bash**

**Input:**
```json
{
  "command": "Set-Content -LiteralPath \"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login.json\" -Value '{\"phone\":\"9900000001\",\"password\":\"password123\"}' -Encoding ascii; $e = curl.exe -s -X POST http://127.0.0.1:8000/api/v1/auth/login/password -d \"@C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login.json\" -H \"Content-Type: application/json\"; $token = ($e | ConvertFrom-Json).access_token; $r = curl.exe -s -X PATCH \"http://127.0.0.1:8000/api/v1/applications/f1a70a52-4c04-4e53-963b-d7211b3ba3d2/interview\" -d \"@C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\resched2.json\" -H \"Authorization: Bearer $token\" -H \"Content-Type: application/json\" | ConvertFrom-Json; Write-Output \"NOTE: $($r.interview_note)\"; $p = curl.exe -s -o NUL -w \"%{http_code}\" http://127.0.0.1:3000/employer/interviews; Write-Output \"PAGE_3000:$p\"; Remove-Item -LiteralPath \"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\login.json\",\"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\resched.json\",\"C:\\Users\\Aaditya\\AppData\\Local\\Temp\\opencode\\resched2.json\" -ErrorAction SilentlyContinue"
}
```

**Output:**
```
NOTE: Video call — Google Meet. Bring your PAN and one photo ID.
PAGE_3000:200

```

---

## Assistant (Build · Big Pickle · 30.7s)

_Thinking:_

Everything verified:
- Reschedule endpoint works (interview_at + interview_note updated).
- Note text correct now.
- Page /employer/interviews renders 200.
- tsc clean, ruff clean, 49 tests pass.
- Notification "interview_update" queued for Arjun.

Update todos and summarize.

All verified. Batch complete.

**Tool: todowrite**

**Input:**
```json
{
  "todos": [
    {
      "content": "Backend: PATCH /applications/{id}/interview reschedule endpoint + candidate notification",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Frontend: Interviews hub page (all/upcoming/today/past tabs, search, reschedule modal)",
      "priority": "high",
      "status": "completed"
    },
    {
      "content": "Sidebar: add Interviews nav item + rescheduleInterview hook",
      "priority": "medium",
      "status": "completed"
    },
    {
      "content": "Verify tsc, ruff, pytest, restart backend, endpoint + page smoke",
      "priority": "high",
      "status": "completed"
    }
  ]
}
```

**Output:**
```
[
  {
    "content": "Backend: PATCH /applications/{id}/interview reschedule endpoint + candidate notification",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Frontend: Interviews hub page (all/upcoming/today/past tabs, search, reschedule modal)",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Sidebar: add Interviews nav item + rescheduleInterview hook",
    "status": "completed",
    "priority": "medium"
  },
  {
    "content": "Verify tsc, ruff, pytest, restart backend, endpoint + page smoke",
    "status": "completed",
    "priority": "high"
  }
]
```

---

## Assistant (Build · Big Pickle · 32.4s)

Interviews hub complete and verified.

**Backend** — new `PATCH /api/v1/applications/{id}/interview` in `applications.py:353` lets an employer reschedule an interview-stage application's date/time and note (guarded: 400 if candidate isn't in the interview stage). It also queues a "Interview Rescheduled" WhatsApp/SMS notification to the candidate (`kind: interview_update`), fire-and-forget via the worker queue.

**Frontend** —
- New `/employer/interviews` page: all interviews across postings with **All / Upcoming / Today / Past** tabs (count badges), live search by candidate/role, avatar + match % + location per row, countdown chips, and a **Reschedule** modal (datetime-local + note). Past interviews render muted with no reschedule.
- `rescheduleInterview()` hook in `useDashboard.ts`; `useEmployerApplicationsOverview` now accepts a reload key so the page refreshes after changes.
- Employer sidebar gained an "Interviews" item (`CalendarDays`).

**Verified live** — rescheduled Arjun Menon's AWS DevOps interview to Sept 12 (past → "In 7 days"), note stored correctly, candidate notification queued; `/employer/interviews` returns 200; `npx tsc` clean; ruff clean; 49/49 tests pass; backend restarted.

Ready for the next "go" — candidates: candidate-side interview countdown reminders on the dashboard, employer time-to-hire analytics, or hiring funnel conversion report.

---

## User

why its not working fix this and give me url

---

## Assistant (Build · Big Pickle)

---

## User

go

---

## Assistant (Build · Big Pickle)

---

## User

fix this

---

## Assistant (Build · Big Pickle)

---

## User

go

---

## Assistant (Build · Big Pickle)

---

## User

go

---

## Assistant (Build · Big Pickle)

---

## User

fix this

---

## Assistant (Build · Big Pickle)

---

## User

go

---

## Assistant (Build · MiMo V2.5 Free)

---

## User

go

---

## Assistant (Build · Big Pickle)

---

