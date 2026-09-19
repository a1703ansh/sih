"""Seed script — populate demo data for SkillTrace AI.

The seeder is IDEMPOTENT: every entity is matched against its natural key(s)
before insertion, so re-running is a safe no-op (it only fills missing rows and
reports how many were added vs already present). This makes it safe to leave
``SEED_ON_START=true`` set in Render, and lets a richer seed "top up" an
existing database without wiping it.

Usage: python -m app.seeds
"""
import asyncio
from calendar import monthrange
from datetime import date, timedelta

from sqlalchemy import select, func

from app.database import async_session_factory
from app.core.security import hash_aadhaar, pwd_context
from app.models.candidate import Candidate
from app.models.candidate_job_match import CandidateJobMatch
from app.models.course import Course
from app.models.employer import Employer
from app.models.employer_shortlist import EmployerShortlist
from app.models.enrollment import Enrollment
from app.models.employment_outcome import EmploymentOutcome
from app.models.job_application import JobApplication
from app.models.job_posting import JobPosting
from app.models.scheme_analytics import SchemeAnalytics
from app.models.skill_taxonomy import SkillTaxonomy
from app.models.survey_template import SurveyTemplate
from app.models.training_partner import TrainingPartner
from app.models.user import User


def add_months(d: date, n: int) -> date:
    """Return ``d`` shifted by ``n`` calendar months (clamped to month end)."""
    month = d.month - 1 + n
    year = d.year + month // 12
    month = month % 12 + 1
    day = min(d.day, monthrange(year, month)[1])
    return date(year, month, day)


async def get_or_create(db, model, defaults=None, **ident):
    """Fetch row by ``ident`` cols or create it with ``defaults``.

    Returns ``(obj, created: bool)``. New objects are flushed so their PKs are
    available to later sections.
    """
    existing = (
        await db.execute(select(model).filter_by(**ident))
    ).scalars().first()
    if existing is not None:
        return existing, False
    obj = model(**ident, **(defaults or {}))
    db.add(obj)
    await db.flush()
    return obj, True


def _normalize_skill(name: str) -> str:
    return name.lower().replace(".", "").replace(" ", "-")


# ─────────────────────────────────────────────────────────────────────────────
#  Static demo data
# ─────────────────────────────────────────────────────────────────────────────

TRAINING_PARTNERS = [
    dict(name="SkillEd Solutions", registration_number="TP2026001",
         pan_number="ABCDE1234F", state="Karnataka", district="Bengaluru Urban",
         address="12 MG Road, Bengaluru", contact_person="Manish Verma",
         phone="9800000001", email="info@skilled.in"),
    dict(name="NexGen Training Academy", registration_number="TP2026002",
         pan_number="XYZAB5678G", state="Maharashtra", district="Pune",
         address="8 FC Road, Pune", contact_person="Rohit Joshi",
         phone="9800000002", email="admin@nexgen.in"),
    dict(name="Aditya Skill Center", registration_number="TP2026003",
         pan_number="LMNOP3456J", state="Telangana", district="Hyderabad",
         address="3 Hitech City Rd, Hyderabad", contact_person="Suresh Reddy",
         phone="9800000003", email="info@adityaskill.in"),
    dict(name="Southern Skills Hub", registration_number="TP2026004",
         pan_number="QRSTU7890K", state="Tamil Nadu", district="Chennai",
         address="5 Anna Salai, Chennai", contact_person="Divya Krishnan",
         phone="9800000004", email="hello@southernskills.in"),
]

EMPLOYERS = [
    dict(name="Infosys Ltd", industry="IT Services", state="Karnataka",
         district="Bengaluru Urban", website="https://infosys.com",
         contact_person="HR Team", phone="9900000001", email="hiring@infosys.com"),
    dict(name="TCS", industry="IT Services", state="Maharashtra",
         district="Pune", website="https://tcs.com", contact_person="HR Team",
         phone="9900000002", email="careers@tcs.com"),
    dict(name="Accenture Services", industry="IT Services", state="Telangana",
         district="Hyderabad", website="https://accenture.com",
         contact_person="Talent Team", phone="9900000003", email="talent@accenture.in"),
    dict(name="HDFC Bank", industry="BFSI", state="Maharashtra",
         district="Mumbai", website="https://hdfcbank.com",
         contact_person="HR Team", phone="9900000004", email="careers@hdfcbank.com"),
    dict(name="TVS Motor Company", industry="Manufacturing", state="Tamil Nadu",
         district="Chennai", website="https://tvsmotor.com",
         contact_person="HR Team", phone="9900000005", email="joinus@tvsmotor.com"),
]

COURSES = [
    dict(key="py", tp="SkillEd Solutions", name="Python Programming (Full-Stack)",
         sector="IT", duration_weeks=24, total_seats=60, ncvt_code="IT-2026-PY-01",
         scheme_id="PMKVY-4.0", cost_per_candidate=15000.00,
         skills_taught=["Python", "Django", "SQL", "Git", "FastAPI"]),
    dict(key="da", tp="SkillEd Solutions", name="Data Analysis with Python",
         sector="IT", duration_weeks=16, total_seats=45, ncvt_code="IT-2026-DA-01",
         scheme_id="PMKVY-4.0", cost_per_candidate=12000.00,
         skills_taught=["Python", "Pandas", "NumPy", "SQL", "Tableau"]),
    dict(key="cd", tp="SkillEd Solutions", name="Cloud & DevOps Essentials",
         sector="IT", duration_weeks=20, total_seats=40, ncvt_code="IT-2026-CD-01",
         scheme_id="NSDC", cost_per_candidate=14000.00,
         skills_taught=["Linux", "Docker", "Kubernetes", "AWS", "CI/CD"]),
    dict(key="fe", tp="NexGen Training Academy", name="Frontend Web Development",
         sector="IT", duration_weeks=20, total_seats=50, ncvt_code="IT-2026-FE-01",
         scheme_id="NSDC", cost_per_candidate=11000.00,
         skills_taught=["HTML", "CSS", "JavaScript", "React.js", "Node.js"]),
    dict(key="rs", tp="NexGen Training Academy", name="Retail Sales & Customer Service",
         sector="Retail", duration_weeks=12, total_seats=80, ncvt_code="IT-2026-RS-01",
         scheme_id="PMKVY-4.0", cost_per_candidate=8000.00,
         skills_taught=["Customer Service", "Sales", "Communication"]),
    dict(key="et", tp="Aditya Skill Center",
         name="Electrical Technician (Home & Industrial)", sector="Electrical",
         duration_weeks=24, total_seats=90, ncvt_code="EL-2026-ET-01",
         scheme_id="PMKVY-4.0", cost_per_candidate=9000.00,
         skills_taught=["Electrical Wiring", "Motor Installation", "Circuit Diagnosis", "Safety"]),
    dict(key="mo", tp="Aditya Skill Center", name="MS Office & Digital Literacy",
         sector="IT", duration_weeks=8, total_seats=100, ncvt_code="IT-2026-MO-01",
         scheme_id="NSDC", cost_per_candidate=6000.00,
         skills_taught=["Excel", "PowerPoint", "Word", "Gmail"]),
    dict(key="ha", tp="Southern Skills Hub", name="Healthcare Assistant & First Aid",
         sector="Healthcare", duration_weeks=20, total_seats=70, ncvt_code="HC-2026-HA-01",
         scheme_id="NSDC", cost_per_candidate=10000.00,
         skills_taught=["Patient Care", "First Aid", "Vital Signs", "Hygiene"]),
    dict(key="fw", tp="Southern Skills Hub",
         name="Full-Stack Web Development (Advanced)", sector="IT",
         duration_weeks=28, total_seats=45, ncvt_code="IT-2026-FW-01",
         scheme_id="PMKVY-4.0", cost_per_candidate=18000.00,
         skills_taught=["JavaScript", "React.js", "Node.js", "PostgreSQL", "DevOps"]),
]

# (name, phone, email, aadhaar, dob, gender, state, district, pincode,
#  digilocker_status, skill_tags, preferred_job_states)
CANDIDATES = [
    ("Rahul Sharma", "9876543210", "rahul.sharma@example.com", "123456789012",
     "1995-03-14", "M", "Karnataka", "Bengaluru Urban", "560001", "verified",
     ["Python", "Django", "SQL", "Git"], ["Karnataka", "Maharashtra"]),
    ("Priya Patel", "9876543211", "priya.patel@example.com", "234567890123",
     "1997-08-21", "F", "Maharashtra", "Pune", "411001", "verified",
     ["Python", "Data Analysis", "Pandas", "SQL"], ["Maharashtra", "Karnataka"]),
    ("Amit Kumar", "9876543212", "amit.kumar@example.com", "345678901234",
     "1999-01-09", "M", "Delhi", "New Delhi", "110001", "pending",
     ["HTML", "CSS", "JavaScript"], ["Delhi", "Karnataka"]),
    ("Sunita Yadav", "9876543213", "sunita.yadav@example.com", "456789012345",
     "1998-04-12", "F", "Uttar Pradesh", "Lucknow", "226001", "verified",
     ["Electrical Wiring", "Circuit Diagnosis", "Safety"], ["Uttar Pradesh", "Delhi"]),
    ("Ramesh Kumar", "9876543214", "ramesh.kumar@example.com", "567890123456",
     "1997-11-03", "M", "Telangana", "Hyderabad", "500001", "verified",
     ["Python", "Data Analysis", "Pandas", "SQL"], ["Telangana", "Karnataka"]),
    ("Kavita Nair", "9876543215", "kavita.nair@example.com", "678901234567",
     "2000-01-22", "F", "Kerala", "Ernakulam", "682001", "verified",
     ["JavaScript", "React.js", "Node.js"], ["Kerala", "Karnataka"]),
    ("Mohammed Irfan", "9876543216", "mohammed.irfan@example.com", "789012345678",
     "1996-08-30", "M", "Tamil Nadu", "Chennai", "600001", "pending",
     ["Customer Service", "Sales", "Communication"], ["Tamil Nadu", "Karnataka"]),
    ("Pooja Gupta", "9876543217", "pooja.gupta@example.com", "890123456789",
     "1999-07-15", "F", "Maharashtra", "Pune", "411014", "verified",
     ["Python", "Django", "FastAPI", "SQL"], ["Maharashtra", "Karnataka"]),
    ("Arjun Singh", "9876543218", "arjun.singh@example.com", "901234567890",
     "1995-02-25", "M", "Rajasthan", "Jaipur", "302001", "verified",
     ["HTML", "CSS", "JavaScript"], ["Rajasthan", "Delhi"]),
    ("Meena Kumari", "9876543219", "meena.kumari@example.com", "112233445566",
     "2001-09-10", "F", "Bihar", "Patna", "800001", "verified",
     ["Excel", "Word", "PowerPoint"], ["Bihar", "Maharashtra"]),
    ("Vikram Malhotra", "9876543220", "vikram.malhotra@example.com", "223344556677",
     "1993-12-05", "M", "Delhi", "New Delhi", "110017", "verified",
     ["Patient Care", "First Aid", "Vital Signs"], ["Delhi"]),
    ("Sneha Deshmukh", "9876543221", "sneha.deshmukh@example.com", "334455667788",
     "1998-06-18", "F", "Gujarat", "Ahmedabad", "380001", "pending",
     ["Sales", "Marketing", "Communication"], ["Gujarat", "Maharashtra"]),
    ("Rajesh Nair", "9876543222", "rajesh.nair@example.com", "445566778899",
     "1997-03-27", "M", "Telangana", "Hyderabad", "500016", "verified",
     ["Docker", "Kubernetes", "AWS", "Linux"], ["Telangana", "Karnataka"]),
    ("Aarti Kulkarni", "9876543223", "aarti.kulkarni@example.com", "556677889900",
     "2000-11-11", "F", "Karnataka", "Bengaluru Urban", "560001", "verified",
     ["SQL", "Data Analysis", "Tableau"], ["Karnataka", "Maharashtra"]),
    ("Manoj Tiwari", "9876543224", "manoj.tiwari@example.com", "667788990011",
     "1996-05-20", "M", "Uttar Pradesh", "Noida", "201301", "verified",
     ["JavaScript", "React.js", "Node.js", "PostgreSQL"], ["Uttar Pradesh", "Delhi"]),
    ("Farida Khan", "9876543225", "farida.khan@example.com", "778899001122",
     "2002-02-14", "F", "Tamil Nadu", "Coimbatore", "641001", "verified",
     ["Patient Care", "Hygiene", "Vital Signs", "First Aid"], ["Tamil Nadu"]),
]

# (candidate_name, course_key, completed_days_ago or None, certificate_id or None)
ENROLLMENTS = [
    ("Rahul Sharma", "py", 10, "PMKVY-2026-8842"),
    ("Priya Patel", "da", 5, "PMKVY-2026-8843"),
    ("Amit Kumar", "fe", None, None),
    ("Sunita Yadav", "et", 240, "PMKVY-2026-8844"),
    ("Sunita Yadav", "da", None, None),
    ("Ramesh Kumar", "da", 200, "PMKVY-2026-8845"),
    ("Ramesh Kumar", "cd", None, None),
    ("Kavita Nair", "fe", 150, "PMKVY-2026-8846"),
    ("Kavita Nair", "fw", 400, "PMKVY-2026-8847"),
    ("Mohammed Irfan", "rs", 120, "PMKVY-2026-8848"),
    ("Mohammed Irfan", "py", None, None),
    ("Pooja Gupta", "py", 420, "PMKVY-2026-8849"),
    ("Arjun Singh", "fe", 100, "PMKVY-2026-8850"),
    ("Arjun Singh", "fw", None, None),
    ("Meena Kumari", "mo", 90, "PMKVY-2026-8851"),
    ("Vikram Malhotra", "ha", 480, "PMKVY-2026-8852"),
    ("Sneha Deshmukh", "rs", 120, "PMKVY-2026-8853"),
    ("Sneha Deshmukh", "mo", 40, "PMKVY-2026-8854"),
    ("Rajesh Nair", "cd", 400, "PMKVY-2026-8855"),
    ("Aarti Kulkarni", "da", 140, "PMKVY-2026-8856"),
    ("Aarti Kulkarni", "py", None, None),
    ("Manoj Tiwari", "fw", 260, "PMKVY-2026-8857"),
    ("Manoj Tiwari", "cd", None, None),
    ("Farida Khan", "ha", None, None),
]

# (candidate, course_key, interval, is_employed, is_self_employed,
#  employer_name or None, job_title or None, monthly_salary or None,
#  months_at_employer or None, verified_by_employer)
OUTCOMES = [
    ("Sunita Yadav", "et", "3_month", True, False, "TVS Motor Company",
     "Electrical Technician", 18000, 7, False),
    ("Sunita Yadav", "et", "6_month", True, False, "TVS Motor Company",
     "Electrical Technician", 21000, 12, False),
    ("Ramesh Kumar", "da", "3_month", True, False, "Accenture Services",
     "Data Analyst", 30000, 9, False),
    ("Ramesh Kumar", "da", "6_month", True, False, "Accenture Services",
     "Data Analyst", 34000, 13, False),
    ("Kavita Nair", "fe", "3_month", True, True, None,
     "Freelance Web Developer", 25000, 5, False),
    ("Kavita Nair", "fw", "3_month", True, False, "TCS",
     "Full-Stack Developer", 32000, 6, False),
    ("Kavita Nair", "fw", "6_month", True, False, "TCS",
     "Full-Stack Developer", 38000, 10, False),
    ("Kavita Nair", "fw", "12_month", True, False, "Accenture Services",
     "Full-Stack Developer", 45000, 15, False),
    ("Mohammed Irfan", "rs", "3_month", False, False, None, None, None, None, False),
    ("Pooja Gupta", "py", "3_month", True, False, "Infosys Ltd",
     "Python Developer", 36000, 8, False),
    ("Pooja Gupta", "py", "6_month", True, False, "Infosys Ltd",
     "Python Developer", 42000, 12, False),
    ("Pooja Gupta", "py", "12_month", True, False, "Infosys Ltd",
     "Python Developer", 50000, 18, True),
    ("Arjun Singh", "fe", "3_month", False, False, None, None, None, None, False),
    ("Meena Kumari", "mo", "3_month", False, False, None, None, None, None, False),
    ("Vikram Malhotra", "ha", "3_month", True, True, None,
     "Home Care Nurse", 15000, 4, False),
    ("Vikram Malhotra", "ha", "6_month", True, True, None,
     "Home Care Nurse", 18000, 8, False),
    ("Vikram Malhotra", "ha", "12_month", True, True, None,
     "Home Care Nurse", 22000, 14, False),
    ("Sneha Deshmukh", "rs", "3_month", False, False, None, None, None, None, False),
    ("Rajesh Nair", "cd", "3_month", True, False, "Accenture Services",
     "DevOps Engineer", 38000, 8, False),
    ("Rajesh Nair", "cd", "6_month", True, False, "Accenture Services",
     "DevOps Engineer", 45000, 12, False),
    ("Rajesh Nair", "cd", "12_month", True, False, "Infosys Ltd",
     "Cloud Engineer", 52000, 16, False),
    ("Aarti Kulkarni", "da", "3_month", False, False, None, None, None, None, False),
    ("Manoj Tiwari", "fw", "3_month", True, False, "TCS",
     "Full-Stack Developer", 34000, 7, False),
    ("Manoj Tiwari", "fw", "6_month", True, False, "TCS",
     "Full-Stack Developer", 40000, 11, False),
]

# (employer, title, required_skills, preferred_skills, location, state, district,
#  salary_min, salary_max, experience_min_months, is_active)
JOB_POSTINGS = [
    ("Infosys Ltd", "Python Developer", ["Python", "Django", "FastAPI", "SQL"],
     ["Cloud Computing", "Git"], "Bengaluru", "Karnataka", "Bengaluru Urban",
     35000, 45000, 12, True),
    ("Infosys Ltd", "Junior Data Analyst", ["SQL", "Data Analysis", "Pandas", "Tableau"],
     [], "Bengaluru", "Karnataka", "Bengaluru Urban", 28000, 38000, 6, True),
    ("Infosys Ltd", "Site Reliability Engineer", ["AWS", "Docker", "Kubernetes", "Linux"],
     [], "Bengaluru", "Karnataka", "Bengaluru Urban", 50000, 70000, 36, False),
    ("TCS", "Full-Stack Developer (React+Node)", ["JavaScript", "React.js", "Node.js"],
     ["PostgreSQL"], "Pune", "Maharashtra", "Pune", 30000, 42000, 12, True),
    ("TCS", "Frontend Developer", ["HTML", "CSS", "JavaScript", "React.js"],
     [], "Pune", "Maharashtra", "Pune", 25000, 35000, 6, True),
    ("TCS", "Senior DevOps Engineer", ["Docker", "Kubernetes", "AWS", "Linux"],
     [], "Pune", "Maharashtra", "Pune", 45000, 60000, 24, True),
    ("Accenture Services", "Data Analyst", ["Python", "Pandas", "SQL", "Tableau"],
     [], "Hyderabad", "Telangana", "Hyderabad", 30000, 40000, 6, True),
    ("Accenture Services", "Full-Stack Developer", ["JavaScript", "React.js", "Node.js", "PostgreSQL"],
     [], "Hyderabad", "Telangana", "Hyderabad", 35000, 50000, 12, True),
    ("Accenture Services", "AWS Cloud Engineer", ["AWS", "Linux", "Docker", "Kubernetes"],
     [], "Hyderabad", "Telangana", "Hyderabad", 40000, 55000, 18, True),
    ("HDFC Bank", "Customer Service Associate", ["Customer Service", "Communication"],
     [], "Mumbai", "Maharashtra", "Mumbai", 20000, 28000, 6, True),
    ("HDFC Bank", "Back Office Executive", ["Excel", "Word", "Communication"],
     [], "Mumbai", "Maharashtra", "Mumbai", 18000, 25000, 3, True),
    ("HDFC Bank", "Data Analyst (Risk)", ["SQL", "Data Analysis", "Excel"],
     [], "Mumbai", "Maharashtra", "Mumbai", 32000, 45000, 12, True),
    ("TVS Motor Company", "Electrical Technician", ["Electrical Wiring", "Circuit Diagnosis", "Safety"],
     [], "Chennai", "Tamil Nadu", "Chennai", 18000, 24000, 6, True),
    ("TVS Motor Company", "Production Support Technician", ["Electrical Wiring", "Problem Solving", "Safety"],
     [], "Chennai", "Tamil Nadu", "Chennai", 16000, 22000, 6, True),
]

# (candidate, employer, title, status, applied_days_ago, match_score)
JOB_APPLICATIONS = [
    ("Pooja Gupta", "Infosys Ltd", "Python Developer", "hired", 150, 88),
    ("Rahul Sharma", "Infosys Ltd", "Python Developer", "shortlisted", 60, 82),
    ("Aarti Kulkarni", "Infosys Ltd", "Python Developer", "rejected", 30, 71),
    ("Ramesh Kumar", "Infosys Ltd", "Junior Data Analyst", "hired", 120, 86),
    ("Aarti Kulkarni", "Infosys Ltd", "Junior Data Analyst", "hired", 100, 84),
    ("Priya Patel", "Infosys Ltd", "Junior Data Analyst", "applied", 5, 79),
    ("Pooja Gupta", "Infosys Ltd", "Junior Data Analyst", "rejected", 45, 74),
    ("Kavita Nair", "TCS", "Full-Stack Developer (React+Node)", "hired", 140, 85),
    ("Manoj Tiwari", "TCS", "Full-Stack Developer (React+Node)", "shortlisted", 20, 83),
    ("Arjun Singh", "TCS", "Full-Stack Developer (React+Node)", "interview", 10, 76),
    ("Kavita Nair", "TCS", "Frontend Developer", "applied", 3, 80),
    ("Arjun Singh", "TCS", "Frontend Developer", "offered", 8, 78),
    ("Amit Kumar", "TCS", "Frontend Developer", "applied", 2, 70),
    ("Rajesh Nair", "TCS", "Senior DevOps Engineer", "hired", 180, 91),
    ("Rajesh Nair", "Accenture Services", "AWS Cloud Engineer", "applied", 6, 87),
    ("Ramesh Kumar", "Accenture Services", "Data Analyst", "shortlisted", 15, 81),
    ("Kavita Nair", "Accenture Services", "Full-Stack Developer", "rejected", 25, 72),
    ("Manoj Tiwari", "Accenture Services", "Full-Stack Developer", "hired", 60, 84),
    ("Pooja Gupta", "Accenture Services", "Full-Stack Developer", "interview", 12, 80),
    ("Mohammed Irfan", "HDFC Bank", "Customer Service Associate", "hired", 90, 77),
    ("Sneha Deshmukh", "HDFC Bank", "Customer Service Associate", "shortlisted", 18, 75),
    ("Sneha Deshmukh", "HDFC Bank", "Back Office Executive", "rejected", 12, 68),
    ("Meena Kumari", "HDFC Bank", "Back Office Executive", "hired", 70, 76),
    ("Sunita Yadav", "TVS Motor Company", "Electrical Technician", "hired", 200, 90),
    ("Sunita Yadav", "TVS Motor Company", "Production Support Technician", "applied", 60, 85),
    ("Priya Patel", "HDFC Bank", "Data Analyst (Risk)", "applied", 4, 73),
    ("Rahul Sharma", "HDFC Bank", "Data Analyst (Risk)", "shortlisted", 9, 72),
    ("Rajesh Nair", "HDFC Bank", "Data Analyst (Risk)", "rejected", 40, 70),
    ("Meena Kumari", "HDFC Bank", "Customer Service Associate", "applied", 2, 69),
    ("Sneha Deshmukh", "TVS Motor Company", "Production Support Technician", "interview", 6, 74),
    ("Mohammed Irfan", "TVS Motor Company", "Production Support Technician", "applied", 1, 71),
    ("Ramesh Kumar", "TCS", "Full-Stack Developer (React+Node)", "applied", 2, 77),
    ("Ramesh Kumar", "Accenture Services", "AWS Cloud Engineer", "interview", 5, 78),
    ("Aarti Kulkarni", "Accenture Services", "Data Analyst", "applied", 7, 76),
    ("Kavita Nair", "Infosys Ltd", "Junior Data Analyst", "rejected", 20, 65),
    ("Manoj Tiwari", "TCS", "Senior DevOps Engineer", "interview", 3, 79),
    ("Rahul Sharma", "Infosys Ltd", "Junior Data Analyst", "rejected", 40, 63),
    ("Vikram Malhotra", "HDFC Bank", "Customer Service Associate", "applied", 1, 62),
    ("Arjun Singh", "HDFC Bank", "Customer Service Associate", "offered", 6, 66),
    ("Amit Kumar", "HDFC Bank", "Customer Service Associate", "offered", 5, 64),
]

# (employer, candidate)
SHORTLISTS = [
    ("Infosys Ltd", "Pooja Gupta"),
    ("Infosys Ltd", "Ramesh Kumar"),
    ("Infosys Ltd", "Aarti Kulkarni"),
    ("TCS", "Kavita Nair"),
    ("TCS", "Manoj Tiwari"),
    ("Accenture Services", "Rajesh Nair"),
    ("Accenture Services", "Ramesh Kumar"),
    ("HDFC Bank", "Meena Kumari"),
    ("HDFC Bank", "Mohammed Irfan"),
    ("TVS Motor Company", "Sunita Yadav"),
]

# (scheme, tp, period, state, district, enrolled, completed, placed3, placed6,
#  placed12, completion_rate, total_cost, cost_per_placement, avg_salary,
#  roi_score, curriculum_market_fit_score, alert_status, alert_reason)
SCHEME_ANALYTICS = [
    ("PMKVY-4.0", "SkillEd Solutions", date(2026, 1, 1), "Karnataka", "Bengaluru Urban",
     180, 156, 120, 95, 72, 86.67, 2700000, 22500.00, 22000, 1.32, 82.0, "active", None),
    ("PMKVY-4.0", "SkillEd Solutions", date(2026, 4, 1), "Karnataka", "Bengaluru Urban",
     210, 184, 148, 118, None, 87.62, 3150000, 21284.00, 23500, 1.36, 84.0, "active", None),
    ("PMKVY-4.0", "NexGen Training Academy", date(2026, 1, 1), "Maharashtra", "Pune",
     120, 102, 78, 55, 34, 85.00, 1560000, 20000.00, 21000, 1.28, 78.0, "active", None),
    ("NSDC", "NexGen Training Academy", date(2026, 1, 1), "Maharashtra", "Pune",
     140, 118, 70, 48, 26, 84.29, 1540000, 22000.00, 18000, 1.15, 74.0, "active", None),
    ("PMKVY-4.0", "Aditya Skill Center", date(2026, 1, 1), "Telangana", "Hyderabad",
     200, 170, 138, 112, 82, 85.00, 1800000, 13043.48, 17000, 1.40, 86.0, "active", None),
    ("NSDC", "Aditya Skill Center", date(2026, 1, 1), "Telangana", "Hyderabad",
     90, 58, 21, 14, 7, 64.44, 540000, 25714.29, 14000, 0.62, 55.0, "underperforming",
     "Low placement for digital-literacy cohort"),
    ("NSDC", "Southern Skills Hub", date(2026, 1, 1), "Tamil Nadu", "Chennai",
     110, 96, 74, 58, 41, 87.27, 1100000, 14864.86, 19000, 1.21, 80.0, "active", None),
    ("PMKVY-4.0", "Southern Skills Hub", date(2026, 4, 1), "Tamil Nadu", "Chennai",
     95, 70, 52, 33, None, 73.68, 1710000, 32884.62, 26000, 1.19, 79.0, "active", None),
]

# (name, category, sector, is_trending, trend_score)
SKILL_TAXONOMY = [
    ("Python", "technical", "IT", True, 88),
    ("SQL", "technical", "IT", False, 74),
    ("Data Analysis", "technical", "IT", True, 82),
    ("React.js", "technical", "IT", True, 85),
    ("Cloud Computing", "technical", "IT", True, 86),
    ("Digital Marketing", "domain", "Marketing", False, 65),
    ("Communication", "soft", "general", False, 62),
    ("Teamwork", "soft", "general", False, 60),
    ("Problem Solving", "soft", "general", False, 63),
    ("FastAPI", "technical", "IT", True, 84),
    ("Django", "technical", "IT", True, 83),
    ("Node.js", "technical", "IT", True, 81),
    ("Pandas", "technical", "IT", False, 72),
    ("NumPy", "technical", "IT", False, 70),
    ("Tableau", "technical", "IT", False, 69),
    ("Docker", "technical", "IT", True, 88),
    ("Kubernetes", "technical", "IT", True, 90),
    ("AWS", "technical", "IT", True, 87),
    ("Linux", "technical", "IT", False, 75),
    ("HTML", "technical", "IT", False, 61),
    ("CSS", "technical", "IT", False, 61),
    ("JavaScript", "technical", "IT", True, 82),
    ("Electrical Wiring", "domain", "Electrical", False, 66),
    ("Circuit Diagnosis", "domain", "Electrical", False, 64),
    ("First Aid", "domain", "Healthcare", False, 63),
    ("Patient Care", "domain", "Healthcare", False, 66),
    ("Excel", "technical", "IT", False, 59),
    ("Customer Service", "soft", "general", False, 57),
    ("Sales", "domain", "Retail", False, 60),
]


SURVEY_TEMPLATES = [
    dict(name="whatsapp_3month", channel="whatsapp",
         template_sid="HX_template_3month",
         body=("Hi {{firstName}}, hope your training worked out well! "
               "Are you currently employed? Reply YES or NO, and include "
               "your role & salary if employed.\n\n"
               "Or update via the portal: {{surveyLink}}"),
         variables=[{"key": "firstName", "label": "First Name"},
                    {"key": "surveyLink", "label": "Survey Link"}],
         allowed_replies=["YES", "NO"], interval="3_month", version=1, is_active=True),
    dict(name="whatsapp_6month", channel="whatsapp",
         template_sid="HX_template_6month",
         body=("Hi {{firstName}}, six months on from your course — are you "
               "currently employed? Reply YES/NO and mention your role and "
               "monthly salary if working.\n\nPortal: {{surveyLink}}"),
         variables=[{"key": "firstName", "label": "First Name"},
                    {"key": "surveyLink", "label": "Survey Link"}],
         allowed_replies=["YES", "NO"], interval="6_month", version=1, is_active=True),
    dict(name="whatsapp_12month", channel="whatsapp",
         template_sid="HX_template_12month",
         body=("Hi {{firstName}}, one year since your program! Are you "
               "currently employed? Reply YES/NO and your role + salary.\n\n"
               "Portal: {{surveyLink}}"),
         variables=[{"key": "firstName", "label": "First Name"},
                    {"key": "surveyLink", "label": "Survey Link"}],
         allowed_replies=["YES", "NO"], interval="12_month", version=1, is_active=True),
    dict(name="sms_3month", channel="sms", template_sid=None,
         body=("SkillTrace: Are you employed now? Reply YES/NO + role & "
               "salary. Or use portal {{surveyLink}}"),
         variables=[{"key": "firstName", "label": "First Name"},
                    {"key": "surveyLink", "label": "Survey Link"}],
         allowed_replies=["YES", "NO"], interval="3_month", version=1, is_active=True),
]


async def seed() -> None:
    counts: dict[str, tuple[int, int]] = {}
    today = date.today()

    async with async_session_factory() as db:
        # ─── Training Partners ───
        tps: dict[str, TrainingPartner] = {}
        added = 0
        for data in TRAINING_PARTNERS:
            tp, created = await get_or_create(
                db, TrainingPartner,
                defaults={k: v for k, v in data.items() if k != "registration_number"},
                registration_number=data["registration_number"],
            )
            tps[data["name"]] = tp
            added += int(created)
        counts["training_partners"] = (added, len(TRAINING_PARTNERS) - added)

        # ─── Employers ───
        emps: dict[str, Employer] = {}
        added = 0
        for data in EMPLOYERS:
            emp, created = await get_or_create(
                db, Employer,
                defaults={k: v for k, v in data.items() if k != "phone"},
                phone=data["phone"],
            )
            emps[data["name"]] = emp
            added += int(created)
        counts["employers"] = (added, len(EMPLOYERS) - added)

        # ─── Courses ───
        courses_by_key: dict[str, Course] = {}
        added = 0
        for data in COURSES:
            course, created = await get_or_create(
                db, Course,
                defaults={
                    "training_partner_id": tps[data["tp"]].id,
                    "name": data["name"],
                    "sector": data["sector"],
                    "duration_weeks": data["duration_weeks"],
                    "total_seats": data["total_seats"],
                    "curriculum_snapshot": {"outcomes": ["certified"]},
                    "skills_taught": data["skills_taught"],
                    "scheme_id": data["scheme_id"],
                    "cost_per_candidate": data["cost_per_candidate"],
                },
                ncvt_code=data["ncvt_code"],
            )
            courses_by_key[data["key"]] = course
            added += int(created)
        counts["courses"] = (added, len(COURSES) - added)

        # ─── Candidates ───
        candidates: dict[str, Candidate] = {}
        added = 0
        for (full_name, phone, email, aadhaar, dob, gender, state, district,
             pincode, digilocker, skills, job_states) in CANDIDATES:
            cand, created = await get_or_create(
                db, Candidate,
                defaults={
                    "phone": phone,
                    "email": email,
                    "full_name": full_name,
                    "date_of_birth": dob,
                    "gender": gender,
                    "state": state,
                    "district": district,
                    "pincode": pincode,
                    "digilocker_status": digilocker,
                    "verified_docs": {"aadhaar": True} if digilocker == "verified" else {},
                    "skill_tags": skills,
                    "preferred_job_states": job_states,
                },
                aadhaar_hash=hash_aadhaar(aadhaar),
            )
            candidates[full_name] = cand
            added += int(created)
        counts["candidates"] = (added, len(CANDIDATES) - added)

        # ─── Users ───
        added = 0
        for (full_name, phone, email, aadhaar, *_rest) in CANDIDATES:
            cand = candidates[full_name]
            _, created = await get_or_create(
                db, User,
                defaults={
                    "email": email,
                    "full_name": full_name,
                    "role": "candidate",
                    "password_hash": pwd_context.hash("password123"),
                    "aadhaar_hash": hash_aadhaar(aadhaar),
                    "candidate_id": cand.id,
                    "is_verified": True,
                },
                phone=phone,
            )
            added += int(created)
        for data in TRAINING_PARTNERS:
            _, created = await get_or_create(
                db, User,
                defaults={
                    "email": data["email"],
                    "full_name": f"{data['name']} Admin",
                    "role": "training_partner",
                    "password_hash": pwd_context.hash("password123"),
                    "training_partner_id": tps[data["name"]].id,
                    "is_verified": True,
                },
                phone=data["phone"],
            )
            added += int(created)
        for data in EMPLOYERS:
            _, created = await get_or_create(
                db, User,
                defaults={
                    "email": data["email"],
                    "full_name": data["contact_person"],
                    "role": "employer",
                    "password_hash": pwd_context.hash("password123"),
                    "employer_id": emps[data["name"]].id,
                    "is_verified": True,
                },
                phone=data["phone"],
            )
            added += int(created)
        _, gov_created = await get_or_create(
            db, User,
            defaults={
                "email": "admin@gov.in",
                "full_name": "Government Admin",
                "role": "gov_admin",
                "password_hash": pwd_context.hash("admin123"),
                "is_verified": True,
            },
            phone="9000000000",
        )
        added += int(gov_created)
        counts["users"] = (added, len(CANDIDATES) + len(TRAINING_PARTNERS) + len(EMPLOYERS) + 1 - added)

        # ─── Enrollments ───
        enrollments_by_key: dict[tuple[str, str], Enrollment] = {}
        added = 0
        for (cand_name, course_key, completed_days_ago, cert_id) in ENROLLMENTS:
            cand = candidates[cand_name]
            course = courses_by_key[course_key]
            completed = (today - timedelta(days=completed_days_ago)) if completed_days_ago else None
            enrollment, created = await get_or_create(
                db, Enrollment,
                defaults={
                    "enrollment_date": (completed - timedelta(weeks=course.duration_weeks))
                    if completed else today - timedelta(days=60),
                    "completion_date": completed,
                    "is_completed": completed is not None,
                    "certificate_id": cert_id,
                },
                candidate_id=cand.id,
                course_id=course.id,
                training_partner_id=course.training_partner_id,
            )
            enrollments_by_key[(cand_name, course_key)] = enrollment
            added += int(created)
        counts["enrollments"] = (added, len(ENROLLMENTS) - added)

        # ─── Employment Outcomes ───
        added = 0
        existing_outcomes = 0
        for (cand_name, course_key, interval, is_employed, is_self_employed,
             emp_name, job_title, salary, months_at_employer, verified) in OUTCOMES:
            enrollment = enrollments_by_key[(cand_name, course_key)]
            if enrollment.completion_date is None:
                continue
            course = courses_by_key[course_key]
            outcome, created = await get_or_create(
                db, EmploymentOutcome,
                defaults={
                    "employer_id": emps[emp_name].id if emp_name else None,
                    "survey_date": add_months(enrollment.completion_date, int(interval.split("_")[0])),
                    "is_employed": is_employed,
                    "is_self_employed": is_self_employed or None,
                    "current_job_title": job_title,
                    "monthly_salary": salary,
                    "salary_currency": "INR",
                    "job_location": emp_name and emps[emp_name].district,
                    "is_job_relevant_to_training": is_employed,
                    "skills_used": course.skills_taught if is_employed else [],
                    "additional_skills_acquired": ["Communication"],
                    "employer_retention_confirmed": months_at_employer is not None,
                    "months_at_employer": months_at_employer,
                    "response_channel": "web_portal",
                    "self_reported": True,
                    "verified_by_employer": verified,
                },
                candidate_id=enrollment.candidate_id,
                enrollment_id=enrollment.id,
                survey_interval=interval,
            )
            added += int(created)
            existing_outcomes += int(not created)
        counts["employment_outcomes"] = (added, existing_outcomes)

        # ─── Job Postings ───
        # Postings have no unique column, so resolve by (employer, title, location).
        postings_by_title: dict[str, JobPosting] = {}
        added = 0
        for (emp_name, title, req, pref, location, state, district,
             sal_min, sal_max, exp_months, is_active) in JOB_POSTINGS:
            existing = (await db.execute(
                select(JobPosting).filter_by(
                    employer_id=emps[emp_name].id,
                    title=title,
                    location=location,
                )
            )).scalars().first()
            if existing is not None:
                postings_by_title[title] = existing
                continue
            posting = JobPosting(
                employer_id=emps[emp_name].id,
                source_portal="demo",
                title=title,
                description_cleaned=(
                    f"{title} role at {emp_name}. Requires "
                    f"{', '.join(req)}."
                ),
                required_skills=req,
                preferred_skills=pref,
                location=location,
                state=state,
                district=district,
                salary_min=sal_min,
                salary_max=sal_max,
                experience_min_months=exp_months,
                is_active=is_active,
            )
            db.add(posting)
            await db.flush()
            postings_by_title[title] = posting
            added += 1
        counts["job_postings"] = (added, len(JOB_POSTINGS) - added)

        # ─── Job Applications ───
        added = 0
        for (cand_name, emp_name, title, status, days_ago, match_score) in JOB_APPLICATIONS:
            cand = candidates[cand_name]
            posting = postings_by_title[title]
            app, created = await get_or_create(
                db, JobApplication,
                defaults={
                    "status": status,
                    "cover_note": "Interested in this role. Open to joining "
                                  "at the earliest." if status in ("interview", "offered", "hired") else None,
                    "feedback": None,
                    "offer_start_date": (today - timedelta(days=days_ago) + timedelta(days=45))
                    if status == "hired" else None,
                    "offer_salary": None,
                    "interview_at": (today + timedelta(days=3))
                    if status == "interview" else None,
                    "interview_note": "Technical round scheduled." if status == "interview" else None,
                    "match_score": match_score,
                    "skill_overlap": sorted(
                        set(cand.skill_tags or []) & set(posting.required_skills or [])),
                    "skill_gaps": sorted(
                        set(posting.required_skills or []) - set(cand.skill_tags or [])),
                    "applied_at": today - timedelta(days=days_ago),
                },
                candidate_id=cand.id,
                job_posting_id=posting.id,
            )
            added += int(created)
        counts["job_applications"] = (added, len(JOB_APPLICATIONS) - added)

        # ─── Candidate-Job Matches (top matches per active posting) ───
        added = 0
        existing_match_rows = (
            await db.execute(select(func.count(CandidateJobMatch.id)))
        ).scalar() or 0
        for posting in postings_by_title.values():
            if not posting.is_active:
                continue
            scoring = []
            for cand in candidates.values():
                overlap = set(cand.skill_tags or []) & set(posting.required_skills or [])
                if not overlap:
                    continue
                location_ok = (posting.state == cand.state) or (
                    posting.state in (cand.preferred_job_states or []))
                score = min(95, 55 + 9 * len(overlap) + (4 if location_ok else 0))
                scoring.append((score, cand, overlap))
            for score, cand, overlap in sorted(scoring, key=lambda x: -x[0])[:3]:
                _, created = await get_or_create(
                    db, CandidateJobMatch,
                    defaults={
                        "match_score": score,
                        "skill_overlap": sorted(overlap),
                        "skill_gaps": sorted(set(posting.required_skills or []) - overlap),
                        "location_compatible": posting.state == cand.state,
                        "salary_compatible": True,
                    },
                    candidate_id=cand.id,
                    job_posting_id=posting.id,
                )
                added += int(created)
        counts["job_matches"] = (added, existing_match_rows)

        # ─── Employer Shortlists ───
        added = 0
        for (emp_name, cand_name) in SHORTLISTS:
            _, created = await get_or_create(
                db, EmployerShortlist,
                defaults={"note": "Strong profile — review for next hiring cycle."},
                employer_id=emps[emp_name].id,
                candidate_id=candidates[cand_name].id,
            )
            added += int(created)
        counts["shortlists"] = (added, len(SHORTLISTS) - added)

        # ─── Scheme Analytics ───
        added = 0
        for (scheme_id, tp_name, period, state, district, enrolled, completed,
             placed3, placed6, placed12, completion_rate, total_cost,
             cost_per_placement, avg_salary, roi_score, fit_score, alert, reason) in SCHEME_ANALYTICS:
            _, created = await get_or_create(
                db, SchemeAnalytics,
                defaults={
                    "total_enrolled": enrolled,
                    "total_completed": completed,
                    "completion_rate": completion_rate,
                    "total_placed_3m": placed3,
                    "total_placed_6m": placed6,
                    "total_placed_12m": placed12,
                    "retention_3m": 70.0,
                    "retention_6m": 60.0,
                    "retention_12m": 50.0,
                    "total_cost": total_cost,
                    "cost_per_placement": cost_per_placement,
                    "avg_salary_at_placement": avg_salary,
                    "roi_score": roi_score,
                    "curriculum_market_fit_score": fit_score,
                    "alert_status": alert,
                    "alert_reason": reason,
                },
                scheme_id=scheme_id,
                training_partner_id=tps[tp_name].id,
                period=period,
                state=state,
                district=district,
            )
            added += int(created)
        counts["scheme_analytics"] = (added, len(SCHEME_ANALYTICS) - added)

        # ─── Skill Taxonomy ───
        added = 0
        for (name, category, sector, is_trending, trend_score) in SKILL_TAXONOMY:
            _, created = await get_or_create(
                db, SkillTaxonomy,
                defaults={
                    "sector": sector,
                    "normalized_name": _normalize_skill(name),
                    "is_trending": is_trending,
                    "trend_score": trend_score,
                },
                name=name,
                category=category,
            )
            added += int(created)
        counts["skill_taxonomy"] = (added, len(SKILL_TAXONOMY) - added)

        # ─── Survey Templates ───
        added = 0
        for data in SURVEY_TEMPLATES:
            _, created = await get_or_create(
                db, SurveyTemplate,
                defaults={k: v for k, v in data.items() if k != "name"},
                name=data["name"],
            )
            added += int(created)
        counts["survey_templates"] = (added, len(SURVEY_TEMPLATES) - added)

        await db.commit()

        print("✅ Seed complete (idempotent — existing rows skipped)")
        labels = [
            ("Training Partners", "training_partners"),
            ("Employers", "employers"),
            ("Courses", "courses"),
            ("Candidates", "candidates"),
            ("Enrollments", "enrollments"),
            ("Employment Outcomes", "employment_outcomes"),
            ("Users", "users"),
            ("Job Postings", "job_postings"),
            ("Job Applications", "job_applications"),
            ("Job-Candidate Matches", "job_matches"),
            ("Employer Shortlists", "shortlists"),
            ("Scheme Analytics Rows", "scheme_analytics"),
            ("Skill Taxonomy", "skill_taxonomy"),
            ("Survey Templates", "survey_templates"),
        ]
        for label, key in labels:
            add, exist = counts.get(key, (0, 0))
            print(f"  - {label}: +{add} added, {exist} already present")

        # ─── Final database totals ───
        async def count(model, *filters):
            res = await db.execute(
                select(func.count(model.id)).where(*filters) if filters else select(func.count(model.id))
            )
            return res.scalar() or 0

        print("\n📊 Database totals:")
        print(f"  - Candidates: {await count(Candidate)}")
        print(f"  - Training Partners: {await count(TrainingPartner)}")
        print(f"  - Employers: {await count(Employer)}")
        print(f"  - Courses: {await count(Course)}")
        print(f"  - Enrollments: {await count(Enrollment)}")
        print(f"  - Employment Outcomes: {await count(EmploymentOutcome)}")
        print(f"  - Users: {await count(User)}")
        print(f"  - Job Postings: {await count(JobPosting)}")
        print(f"  - Applications: {await count(JobApplication)}")
        placed = await count(EmploymentOutcome, EmploymentOutcome.is_employed == True)
        total_out = await count(EmploymentOutcome)
        rate = round(placed / max(total_out, 1) * 100, 2) if total_out else None
        print(f"  - Placement rate: {rate}%")
        print("\n  Demo logins: candidates 9876543210-25 / password123, TP 9800000001-04, "
              "employers 9900000001-05, gov admin 9000000000 / admin123")


if __name__ == "__main__":
    asyncio.run(seed())