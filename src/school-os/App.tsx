// @ts-nocheck
import React, { useState, useMemo, useEffect } from "react";
import { useLiveStudents } from "@/hooks/useLiveStudents";
import { useLiveStaff } from "@/hooks/useLiveStaff";
import { useLiveSections } from "@/hooks/useLiveSections";
import {
  School, Search, Bell, ChevronDown, Phone, Calendar, Users, TrendingUp,
  Plus, X, MapPin, Mail, Clock, CheckCircle2, ArrowRight, LayoutGrid,
  ClipboardList, UserPlus, Settings, LogOut, ChevronLeft, Star,
  MoreHorizontal, Filter, PhoneCall, CalendarCheck, FileCheck2,
  GraduationCap, IndianRupee, Building2, Bus, Home, UserCheck,
  Layers, ClipboardCheck, Hash, ChevronRight, BookOpen, PenSquare,
  CalendarDays, Award, AlertCircle, Send, MessageSquare, Check, XCircle,
  Trophy, FileText, MessageCircle, CalendarPlus, Wallet, CreditCard, BookMarked,
  AlertTriangle, ArrowRightLeft, TrendingDown, BarChart3, Megaphone, ShieldCheck,
  Briefcase, Palette, PlusCircle, Edit3, History, Sun, Moon, Menu,
  Monitor, Microscope, Utensils, Quote, Building, BedDouble, Route as RouteIcon, Image as ImageIcon,
  Paperclip, Smartphone, Loader2, Landmark, Share2, QrCode, Printer, IdCard, Download, Sparkles
} from "lucide-react";
import { supabase, fetchProfile } from "../lib/supabaseClient";
import { authService } from "@/services/auth.service";

/* ---------------------------------------------------------
   DEMO DATA
--------------------------------------------------------- */

const SCHOOLS = [
  {
    id: "gvs",
    name: "Green Valley School",
    city: "Lucknow, Uttar Pradesh",
    cityName: "Lucknow",
    state: "Uttar Pradesh",
    locality: "Gomti Nagar",
    pincode: "226010",
    lat: 26.8512, lng: 81.0043,
    principal: "Dr. Anjali Mehra",
    color: "#4F46E5",
    colorSoft: "#EEF2FF",
    students: 1240,
    logo: "GV",
    board: "CBSE",
    established: 1998,
    rating: 4.6,
    feeRange: "Rs 18,000 - 45,000 / term",
    about: "Green Valley School has been shaping confident, curious learners in Lucknow for over two decades, with a focus on holistic development alongside academic rigour.",
    agreementStatus: "active",
  },
  {
    id: "bfs",
    name: "Bright Future School",
    city: "Kanpur, Uttar Pradesh",
    cityName: "Kanpur",
    state: "Uttar Pradesh",
    locality: "Swaroop Nagar",
    pincode: "208002",
    lat: 26.4830, lng: 80.3319,
    principal: "Mr. Rajesh Verma",
    color: "#0EA5A0",
    colorSoft: "#ECFEFF",
    students: 860,
    logo: "BF",
    board: "ICSE",
    established: 2005,
    rating: 4.4,
    feeRange: "Rs 15,000 - 38,000 / term",
    about: "Bright Future School blends a strong ICSE academic foundation with a wide range of arts, sports, and leadership programs for every student in Kanpur.",
    agreementStatus: "active",
  },
  {
    id: "dps",
    name: "Delhi Public School",
    city: "Noida, Uttar Pradesh",
    cityName: "Noida",
    state: "Uttar Pradesh",
    locality: "Sector 62",
    pincode: "201309",
    lat: 28.6280, lng: 77.3649,
    principal: "Dr. Sunita Rao",
    color: "#2563EB",
    colorSoft: "#EFF6FF",
    students: 2010,
    logo: "DP",
    board: "CBSE",
    established: 1990,
    rating: 4.8,
    feeRange: "Rs 24,000 - 60,000 / term",
    about: "Delhi Public School Noida is one of the region's most established CBSE campuses, known for its academic outcomes, sports infrastructure, and alumni network.",
    agreementStatus: "active",
  },
  {
    id: "sps",
    name: "Sunrise Public School",
    city: "Varanasi, Uttar Pradesh",
    cityName: "Varanasi",
    state: "Uttar Pradesh",
    locality: "Sigra",
    pincode: "221010",
    lat: 25.3176, lng: 82.9739,
    principal: "Mr. Irfan Khan",
    color: "#D97706",
    colorSoft: "#FFFBEB",
    students: 640,
    logo: "SP",
    board: "State Board",
    established: 2011,
    rating: 4.2,
    feeRange: "Rs 10,000 - 26,000 / term",
    about: "Sunrise Public School offers an affordable, values-driven State Board education in Varanasi, with small class sizes and close parent involvement.",
    agreementStatus: "active",
  },
  {
    id: "hps",
    name: "Heritage Public School",
    city: "Lucknow, Uttar Pradesh",
    cityName: "Lucknow",
    state: "Uttar Pradesh",
    locality: "Indira Nagar",
    pincode: "226016",
    lat: 26.8790, lng: 80.9962,
    principal: "Mrs. Kavita Srivastava",
    color: "#7C3AED",
    colorSoft: "#F5F3FF",
    students: 980,
    logo: "HP",
    board: "CBSE",
    established: 2003,
    rating: 4.5,
    feeRange: "Rs 16,000 - 40,000 / term",
    about: "Heritage Public School combines a strong academic core with music, theatre, and community service programs across its Indira Nagar campus.",
    agreementStatus: "active",
  },
  {
    id: "lms",
    name: "Lotus Montessori School",
    city: "Lucknow, Uttar Pradesh",
    cityName: "Lucknow",
    state: "Uttar Pradesh",
    locality: "Aliganj",
    pincode: "226024",
    lat: 26.8930, lng: 80.9436,
    principal: "Ms. Ritu Bajpai",
    color: "#DB2777",
    colorSoft: "#FDF2F8",
    students: 420,
    logo: "LM",
    board: "ICSE",
    established: 2012,
    rating: 4.7,
    feeRange: "Rs 14,000 - 32,000 / term",
    about: "Lotus Montessori focuses on early years and primary education with small batches, activity-led learning, and daily parent updates.",
    agreementStatus: "active",
  },
  {
    id: "cvs",
    name: "City Convent School",
    city: "Lucknow, Uttar Pradesh",
    cityName: "Lucknow",
    state: "Uttar Pradesh",
    locality: "Hazratganj",
    pincode: "226001",
    lat: 26.8500, lng: 80.9450,
    principal: "Fr. Thomas Mathew",
    color: "#0F766E",
    colorSoft: "#F0FDFA",
    students: 1520,
    logo: "CC",
    board: "ICSE",
    established: 1974,
    rating: 4.6,
    feeRange: "Rs 20,000 - 48,000 / term",
    about: "One of the oldest convent campuses in central Lucknow, known for discipline, English proficiency, and consistent board results.",
    agreementStatus: "active",
  },
  {
    id: "nva",
    name: "Navodaya Vidya Academy",
    city: "Lucknow, Uttar Pradesh",
    cityName: "Lucknow",
    state: "Uttar Pradesh",
    locality: "Alambagh",
    pincode: "226005",
    lat: 26.8090, lng: 80.8880,
    principal: "Mr. Sanjay Tiwari",
    color: "#B45309",
    colorSoft: "#FFFBEB",
    students: 720,
    logo: "NV",
    board: "State Board",
    established: 2008,
    rating: 4.1,
    feeRange: "Rs 8,000 - 22,000 / term",
    about: "An affordable neighbourhood school in Alambagh with a strong focus on foundational literacy, numeracy, and scholarship coaching.",
    agreementStatus: "active",
  },
  {
    id: "sjc",
    name: "St. Joseph's Convent",
    city: "Kanpur, Uttar Pradesh",
    cityName: "Kanpur",
    state: "Uttar Pradesh",
    locality: "Civil Lines",
    pincode: "208001",
    lat: 26.4670, lng: 80.3500,
    principal: "Sr. Maria Fernandes",
    color: "#1D4ED8",
    colorSoft: "#EFF6FF",
    students: 1340,
    logo: "SJ",
    board: "ICSE",
    established: 1982,
    rating: 4.7,
    feeRange: "Rs 18,000 - 42,000 / term",
    about: "St. Joseph's Convent in Civil Lines is a legacy Kanpur campus with strong academics, debate, and inter-school sports traditions.",
    agreementStatus: "active",
  },
  {
    id: "kvn",
    name: "Kanpur Vidya Niketan",
    city: "Kanpur, Uttar Pradesh",
    cityName: "Kanpur",
    state: "Uttar Pradesh",
    locality: "Kakadeo",
    pincode: "208025",
    lat: 26.4700, lng: 80.2960,
    principal: "Dr. Meenakshi Gupta",
    color: "#059669",
    colorSoft: "#ECFDF5",
    students: 690,
    logo: "KV",
    board: "CBSE",
    established: 2009,
    rating: 4.3,
    feeRange: "Rs 12,000 - 30,000 / term",
    about: "Kanpur Vidya Niketan offers a balanced CBSE program with strong STEM labs and an in-house transport network across west Kanpur.",
    agreementStatus: "active",
  },
  {
    id: "ggs",
    name: "Ganga Global School",
    city: "Kanpur, Uttar Pradesh",
    cityName: "Kanpur",
    state: "Uttar Pradesh",
    locality: "Kalyanpur",
    pincode: "208017",
    lat: 26.4950, lng: 80.2670,
    principal: "Mr. Alok Dwivedi",
    color: "#EA580C",
    colorSoft: "#FFF7ED",
    students: 510,
    logo: "GG",
    board: "CBSE",
    established: 2015,
    rating: 4.2,
    feeRange: "Rs 13,000 - 29,000 / term",
    about: "A newer campus in Kalyanpur with smart classrooms, coding from Class 3, and an emphasis on individual learning plans.",
    agreementStatus: "active",
  },
  {
    id: "ais",
    name: "Amity International School",
    city: "Noida, Uttar Pradesh",
    cityName: "Noida",
    state: "Uttar Pradesh",
    locality: "Sector 44",
    pincode: "201303",
    lat: 28.5670, lng: 77.3350,
    principal: "Ms. Renu Chopra",
    color: "#4338CA",
    colorSoft: "#EEF2FF",
    students: 2380,
    logo: "AI",
    board: "CBSE",
    established: 1997,
    rating: 4.7,
    feeRange: "Rs 28,000 - 68,000 / term",
    about: "A large Sector 44 campus with international exchange programs, olympiad training, and extensive co-curricular clubs.",
    agreementStatus: "active",
  },
  {
    id: "gis",
    name: "Genesis Global School",
    city: "Noida, Uttar Pradesh",
    cityName: "Noida",
    state: "Uttar Pradesh",
    locality: "Sector 132",
    pincode: "201304",
    lat: 28.5030, lng: 77.3720,
    principal: "Mr. David Fernandes",
    color: "#0891B2",
    colorSoft: "#ECFEFF",
    students: 1180,
    logo: "GS",
    board: "ICSE",
    established: 2010,
    rating: 4.5,
    feeRange: "Rs 32,000 - 75,000 / term",
    about: "Genesis Global blends an inquiry-led curriculum with residential facilities and a 12-acre campus in the Noida Expressway belt.",
    agreementStatus: "active",
  },
  {
    id: "sfn",
    name: "Springfield Noida",
    city: "Noida, Uttar Pradesh",
    cityName: "Noida",
    state: "Uttar Pradesh",
    locality: "Sector 15A",
    pincode: "201301",
    lat: 28.5860, lng: 77.3170,
    principal: "Mrs. Pooja Sethi",
    color: "#9333EA",
    colorSoft: "#FAF5FF",
    students: 760,
    logo: "SF",
    board: "CBSE",
    established: 2006,
    rating: 4.3,
    feeRange: "Rs 22,000 - 52,000 / term",
    about: "Springfield's compact Sector 15A campus is known for personalised attention, robotics, and a strong primary-years reading program.",
    agreementStatus: "active",
  },
  {
    id: "kis",
    name: "Kashi International School",
    city: "Varanasi, Uttar Pradesh",
    cityName: "Varanasi",
    state: "Uttar Pradesh",
    locality: "Bhelupur",
    pincode: "221010",
    lat: 25.3010, lng: 82.9930,
    principal: "Dr. Neeraj Pandey",
    color: "#C2410C",
    colorSoft: "#FFF7ED",
    students: 830,
    logo: "KI",
    board: "CBSE",
    established: 2004,
    rating: 4.4,
    feeRange: "Rs 14,000 - 34,000 / term",
    about: "Kashi International offers a CBSE curriculum rooted in local culture, with classical music, yoga, and Sanskrit as electives.",
    agreementStatus: "active",
  },
  {
    id: "vgs",
    name: "Varuna Grammar School",
    city: "Varanasi, Uttar Pradesh",
    cityName: "Varanasi",
    state: "Uttar Pradesh",
    locality: "Sarnath",
    pincode: "221007",
    lat: 25.3800, lng: 83.0230,
    principal: "Mrs. Shalini Rai",
    color: "#15803D",
    colorSoft: "#F0FDF4",
    students: 470,
    logo: "VG",
    board: "ICSE",
    established: 2013,
    rating: 4.3,
    feeRange: "Rs 11,000 - 27,000 / term",
    about: "A calm Sarnath campus with outdoor learning spaces, heritage walks, and an inclusive special-educator support team.",
    agreementStatus: "active",
  },
  {
    id: "aps",
    name: "Awadh Public School",
    city: "Prayagraj, Uttar Pradesh",
    cityName: "Prayagraj",
    state: "Uttar Pradesh",
    locality: "Civil Lines",
    pincode: "211001",
    lat: 25.4520, lng: 81.8340,
    principal: "Mr. Harish Chandra",
    color: "#BE123C",
    colorSoft: "#FFF1F2",
    students: 910,
    logo: "AP",
    board: "CBSE",
    established: 1999,
    rating: 4.4,
    feeRange: "Rs 15,000 - 36,000 / term",
    about: "Awadh Public School is a Civil Lines mainstay in Prayagraj with a strong competitive-exam mentoring track from Class 9.",
    agreementStatus: "active",
  },
  {
    id: "tgs",
    name: "Triveni Global School",
    city: "Prayagraj, Uttar Pradesh",
    cityName: "Prayagraj",
    state: "Uttar Pradesh",
    locality: "Naini",
    pincode: "211008",
    lat: 25.3890, lng: 81.8760,
    principal: "Ms. Anuradha Singh",
    color: "#0D9488",
    colorSoft: "#F0FDFA",
    students: 560,
    logo: "TG",
    board: "State Board",
    established: 2014,
    rating: 4.0,
    feeRange: "Rs 9,000 - 21,000 / term",
    about: "Triveni Global serves the Naini belt with affordable fees, bus routes across the river, and a growing vocational skills lab.",
    agreementStatus: "active",
  },
  {
    id: "rvs",
    name: "Rani Laxmibai Vidyalaya",
    city: "Jhansi, Uttar Pradesh",
    cityName: "Jhansi",
    state: "Uttar Pradesh",
    locality: "Civil Lines",
    pincode: "284001",
    lat: 25.4560, lng: 78.5680,
    principal: "Mrs. Deepa Yadav",
    color: "#7E22CE",
    colorSoft: "#FAF5FF",
    students: 640,
    logo: "RL",
    board: "CBSE",
    established: 2001,
    rating: 4.2,
    feeRange: "Rs 10,000 - 25,000 / term",
    about: "A well-regarded Jhansi campus with a girls' leadership program, NCC unit, and strong athletics record.",
    agreementStatus: "active",
  },
  {
    id: "mps",
    name: "Meerut Public School",
    city: "Meerut, Uttar Pradesh",
    cityName: "Meerut",
    state: "Uttar Pradesh",
    locality: "Shastri Nagar",
    pincode: "250004",
    lat: 28.9930, lng: 77.6870,
    principal: "Mr. Vikram Chauhan",
    color: "#1E40AF",
    colorSoft: "#EFF6FF",
    students: 1120,
    logo: "MP",
    board: "CBSE",
    established: 1995,
    rating: 4.5,
    feeRange: "Rs 16,000 - 38,000 / term",
    about: "Meerut Public School offers a large Shastri Nagar campus with sports academies in cricket and shooting alongside CBSE academics.",
    agreementStatus: "active",
  },
];

// Haversine distance in km between two lat/lng points.
function distanceKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function formatDistance(km) {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}


const SCHOOL_FACILITIES = [
  { label: "Smart Classrooms", icon: Monitor },
  { label: "Science & Computer Labs", icon: Microscope },
  { label: "Library", icon: BookMarked },
  { label: "Sports Ground", icon: Trophy },
  { label: "Transport", icon: Bus },
  { label: "Cafeteria", icon: Utensils },
];

const SCHOOL_TESTIMONIALS = [
  { quote: "The teachers genuinely know every child by name. My daughter looks forward to school every single day.", author: "Parent of a Class 2 student" },
  { quote: "Transparent communication, fair fee structure, and a campus that actually feels safe and warm.", author: "Parent of a Class 5 student" },
];

const ROLES = [
  { id: "counselor", label: "Admission Counselor", icon: PhoneCall, desc: "Manage inquiries and admissions" },
  { id: "coordinator", label: "Coordinator", icon: ClipboardList, desc: "Allocate classes and sections" },
  { id: "principal", label: "Principal", icon: GraduationCap, desc: "School performance overview" },
  { id: "teacher", label: "Teacher", icon: Users, desc: "Class and student management" },
  { id: "parent", label: "Parent", icon: Users, desc: "Track your child's journey" },
  { id: "student", label: "Student", icon: GraduationCap, desc: "Your school, your day" },
  { id: "receptionist", label: "Reception", icon: PhoneCall, desc: "Front desk, visitors, calls" },
  { id: "accounts", label: "Accounts", icon: ClipboardList, desc: "Fees, invoices, collections" },
  { id: "hr", label: "HR", icon: Users, desc: "Staff records and payroll" },
  { id: "admin", label: "School Admin", icon: Settings, desc: "Staff, fees, settings" },
  { id: "superadmin", label: "Super Admin", icon: Building2, desc: "Platform-wide control" },
];

// Family Sign In only ever offers these two roles
const FAMILY_ROLES = ROLES.filter((r) => r.id === "parent" || r.id === "student");
// School Staff Sign In offers everyone who works at the school (never Super Admin)
const STAFF_ROLES = ROLES.filter((r) =>
  ["counselor", "coordinator", "teacher", "principal", "receptionist", "accounts", "hr", "admin"].includes(r.id),
);
// Super Admin is not scoped to a school and isn't part of either picker above
const SUPERADMIN_ROLE = ROLES.find((r) => r.id === "superadmin");
// Used to reconstruct a full role object (with its icon) from just the role id
// stored in the `profiles` table after a real Supabase login.
const ROLE_BY_ID = Object.fromEntries(ROLES.map((r) => [r.id, r]));
// Used for AppShell branding when Super Admin is signed in (no single school context)
const PLATFORM_BRAND = { id: "__platform__", name: "Vedaalay", city: "Platform Admin", color: "#4F46E5", colorSoft: "#EEF2FF", logo: "VA" };

const STAGES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "meeting", label: "Meeting Scheduled" },
  { id: "visited", label: "Visited" },
  { id: "interested", label: "Interested" },
  { id: "test", label: "Entrance Test" },
  { id: "qualified", label: "Qualified" },
  { id: "fee", label: "Fee Discussion" },
  { id: "confirmed", label: "Admission Confirmed" },
];

const COUNSELORS = ["Priya Sharma", "Amit Kulkarni", "Neha Singh"];
const CLASSES_APPLIED = ["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 5", "Class 7"];

function makeInquiries() {
  const names = [
    "Aarav Gupta", "Diya Patel", "Vihaan Sharma", "Ananya Rao", "Kabir Singh",
    "Ishita Verma", "Reyansh Yadav", "Myra Chauhan", "Aditya Mishra", "Saanvi Tiwari",
    "Arjun Pandey", "Zara Khan", "Vivaan Agarwal", "Kiara Joshi", "Ayaan Malhotra",
    "Anika Bose", "Krishna Dubey", "Riya Kapoor", "Shaurya Nair", "Pari Saxena",
    "Advait Trivedi", "Navya Chatterjee", "Rudra Mehta", "Aadhya Bhatt", "Yuvraj Rathore",
  ];
  const parents = names.map((n) => n.split(" ")[1] + " Family");
  let idc = 1000;
  return names.map((name, i) => {
    const stageIdx = Math.floor(Math.pow(Math.random(), 1.6) * STAGES.length);
    const daysAgo = Math.floor(Math.random() * 21);
    return {
      id: `INQ-${idc + i}`,
      student: name,
      parentName: parents[i],
      phone: `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`,
      email: `${name.split(" ")[0].toLowerCase()}.parent@example.com`,
      classApplied: CLASSES_APPLIED[i % CLASSES_APPLIED.length],
      stage: STAGES[stageIdx].id,
      counselor: COUNSELORS[i % COUNSELORS.length],
      source: ["Website", "Walk-in", "Referral", "Phone Call", "Social Media"][i % 5],
      createdDaysAgo: daysAgo,
      lastActivity: daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`,
      notes: [
        { date: "2 days ago", text: "Parent called to ask about the entrance test syllabus for " + CLASSES_APPLIED[i % CLASSES_APPLIED.length] + "." },
        { date: "5 days ago", text: "Scheduled a campus visit for the family." },
      ],
    };
  });
}

/* ---------------------------------------------------------
   COORDINATOR / ALLOCATION DATA
--------------------------------------------------------- */

const ACADEMIC_YEARS = ["2026-27", "2025-26"];
const SECTIONS = ["A", "B", "C"];
const HOUSES = ["Aravalli House (Red)", "Vindhya House (Blue)", "Nilgiri House (Green)", "Shivalik House (Yellow)"];
const BUS_ROUTES = [
  "Route 1 - Gomti Nagar", "Route 2 - Alambagh", "Route 3 - Indira Nagar",
  "Route 4 - Hazratganj", "Not Required",
];
const HOSTEL_OPTIONS = ["Not Applicable", "Boys Hostel - Block A", "Girls Hostel - Block B"];
const SECTION_CAPACITY = 40;

const CLASS_TEACHERS = {
  "Nursery": ["Ms. Kavita Rawat", "Ms. Pooja Nigam"],
  "LKG": ["Ms. Shalini Awasthi", "Ms. Rekha Bisht"],
  "UKG": ["Ms. Farah Ansari", "Ms. Deepa Srivastava"],
  "Class 1": ["Mr. Manoj Tiwari", "Ms. Ritu Chandra"],
  "Class 2": ["Ms. Sneha Kulkarni", "Mr. Vikas Gupta"],
  "Class 3": ["Ms. Alka Dixit", "Mr. Sameer Khan"],
  "Class 5": ["Mr. Ravi Prakash", "Ms. Nidhi Saxena"],
  "Class 7": ["Ms. Meenal Joshi", "Mr. Ashok Pandey"],
};

function makeCredentials(inquiry) {
  const base = (inquiry.student || "student").toLowerCase().replace(/[^a-z]/g, "").slice(0, 10) || "student";
  const numId = String(inquiry.id).replace(/\D/g, "").slice(-4).padStart(4, "0");
  const rand = () => Math.random().toString(36).slice(-4);
  return {
    studentUserId: `${base}.${numId}`,
    studentPassword: `Std@${numId}${rand()}`,
    parentUserId: `parent.${base}.${numId}`,
    parentPassword: `Par@${numId}${rand()}`,
  };
}

function deriveEnrolledStudents(inquiries) {
  return inquiries
    .filter((i) => i.stage === "confirmed")
    .map((i) => ({
      id: `STU-${i.id.split("-")[1]}`,
      inquiryId: i.id,
      name: i.student,
      parentName: i.parentName,
      phone: i.phone,
      classApplied: i.classApplied,
      allocated: false,
      academicYear: ACADEMIC_YEARS[0],
      section: null,
      rollNumber: null,
      house: null,
      busRoute: null,
      hostel: "Not Applicable",
      classTeacher: null,
      status: "Recently Enrolled",
      photo: i.photo || null,
      admissionNo: null,
      credentials: i.credentials || null,
    }));
}

/* ---------------------------------------------------------
   TEACHER DATA
--------------------------------------------------------- */

const TEACHER_NAME = "Mr. Sameer Khan";

const TEACHER_TIMETABLE = [
  { period: "1", time: "8:00 - 8:40 AM", subject: "Mathematics", section: "Class 3 - A" },
  { period: "2", time: "8:45 - 9:25 AM", subject: "Mathematics", section: "Class 3 - B" },
  { period: "3", time: "9:30 - 10:10 AM", subject: "Science", section: "Class 3 - A" },
  { period: "4", time: "10:40 - 11:20 AM", subject: "Class Teacher period", section: "Class 3 - A" },
  { period: "5", time: "11:25 - 12:05 PM", subject: "Mathematics", section: "Class 5 - A" },
];

const TEACHER_SECTIONS = ["Class 3 - A", "Class 3 - B", "Class 5 - A"];

const HOMEWORK_SUBJECTS = ["Mathematics", "Science", "English", "Hindi", "EVS"];

const ROSTER_FIRST = ["Aarav", "Diya", "Vihaan", "Ananya", "Kabir", "Ishita", "Reyansh", "Myra", "Aditya", "Saanvi", "Arjun", "Zara", "Vivaan", "Kiara", "Ayaan", "Anika", "Krishna", "Riya", "Shaurya", "Pari", "Advait", "Navya", "Rudra", "Aadhya", "Yuvraj", "Ira", "Dev", "Tara"];
const ROSTER_LAST = ["Gupta", "Patel", "Sharma", "Rao", "Singh", "Verma", "Yadav", "Chauhan", "Mishra", "Tiwari", "Pandey", "Khan", "Agarwal", "Joshi", "Malhotra", "Bose", "Dubey", "Kapoor", "Nair", "Saxena", "Trivedi", "Chatterjee", "Mehta", "Bhatt", "Rathore", "Kumar", "Chopra", "Bhalla"];

function makeRoster(sectionKey) {
  // deterministic-ish seed from section name so each section has a stable roster
  let seed = 0;
  for (let i = 0; i < sectionKey.length; i++) seed += sectionKey.charCodeAt(i);
  const count = 26 + (seed % 6);
  const roster = [];
  for (let i = 0; i < count; i++) {
    const fi = (seed + i * 7) % ROSTER_FIRST.length;
    const li = (seed + i * 13) % ROSTER_LAST.length;
    roster.push({
      id: `${sectionKey.replace(/\s/g, "")}-${i + 1}`,
      rollNumber: i + 1,
      name: `${ROSTER_FIRST[fi]} ${ROSTER_LAST[li]}`,
      section: sectionKey,
      attendancePct: 82 + ((seed + i * 3) % 17),
      house: HOUSES[(seed + i) % HOUSES.length],
    });
  }
  return roster;
}

function makeInitialHomework() {
  return [
    { id: "HW-1", section: "Class 3 - A", subject: "Mathematics", title: "Worksheet: Multiplication tables 6-10", due: "Tomorrow", postedDaysAgo: 1 },
    { id: "HW-2", section: "Class 3 - A", subject: "Science", title: "Draw and label the water cycle", due: "In 3 days", postedDaysAgo: 2 },
    { id: "HW-3", section: "Class 5 - A", subject: "Mathematics", title: "Chapter 4 exercise 4.2, Q1-10", due: "In 2 days", postedDaysAgo: 0 },
  ];
}

function makeInitialLeaveRequests() {
  return [
    { id: "LR-1", studentName: "Zara Khan", section: "Class 3 - A", reason: "Fever, advised rest by doctor", fromDate: "22 Jul", toDate: "23 Jul", status: "pending" },
    { id: "LR-2", studentName: "Rudra Mehta", section: "Class 3 - B", reason: "Family function out of town", fromDate: "24 Jul", toDate: "25 Jul", status: "pending" },
    { id: "LR-3", studentName: "Kiara Joshi", section: "Class 5 - A", reason: "Dental appointment", fromDate: "20 Jul", toDate: "20 Jul", status: "approved" },
  ];
}

/* ---------------------------------------------------------
   STUDENT / PARENT DATA (shared demo child)
--------------------------------------------------------- */

const CHILD = {
  id: "Class3-A-1",
  name: "Aarav Gupta",
  rollNumber: 1,
  section: "Class 3 - A",
  house: HOUSES[0],
  attendancePct: 94,
  admissionNo: "GVS-2024-0312",
};

const SIBLING = {
  id: "Class5-A-1",
  name: "Diya Gupta",
  rollNumber: 1,
  section: "Class 5 - A",
  house: HOUSES[1],
  attendancePct: 91,
  admissionNo: "GVS-2021-0089",
};

const CHILDREN = [CHILD, SIBLING];

function childToIdCardStudent(child, guardianName = "Rohan Gupta", phone = "+91 98100 12345") {
  const [classPart, sectionPart] = (child.section || "").split(" - ");
  return {
    id: child.id,
    name: child.name,
    parentName: guardianName,
    phone,
    classApplied: classPart || child.section,
    section: sectionPart ? `Section ${sectionPart}` : null,
    rollNumber: child.rollNumber,
    admissionNo: child.admissionNo,
    photo: child.photo || null,
  };
}

const FEE_INSTALLMENTS_BY_CHILD_INITIAL = {
  [CHILD.id]: [
    { id: "F1", name: "Term 1 Tuition Fee", amount: 18000, status: "paid", dueDate: "10 Apr 2026" },
    { id: "F2", name: "Term 2 Tuition Fee", amount: 18000, status: "paid", dueDate: "10 Jul 2026" },
    { id: "F3", name: "Term 3 Tuition Fee", amount: 18000, status: "due", dueDate: "10 Oct 2026" },
    { id: "F4", name: "Annual Activity Fee", amount: 4500, status: "due", dueDate: "10 Oct 2026" },
  ],
  [SIBLING.id]: [
    { id: "SF1", name: "Term 1 Tuition Fee", amount: 24000, status: "paid", dueDate: "10 Apr 2026" },
    { id: "SF2", name: "Term 2 Tuition Fee", amount: 24000, status: "due", dueDate: "10 Jul 2026" },
    { id: "SF3", name: "Term 3 Tuition Fee", amount: 24000, status: "due", dueDate: "10 Oct 2026" },
    { id: "SF4", name: "Annual Activity Fee", amount: 5000, status: "due", dueDate: "10 Oct 2026" },
  ],
};

const DIYA_MILESTONES = [
  { date: "8 Feb 2021", title: "Inquiry Created", desc: "Parent inquired about Class 1 admission through a school referral.", icon: ClipboardList },
  { date: "12 Feb 2021", title: "Parent Called", desc: "Counselor called to discuss the admission process and required documents.", icon: PhoneCall },
  { date: "20 Feb 2021", title: "Campus Visit", desc: "Family toured the primary wing and met the Class 1 coordinator.", icon: MapPin },
  { date: "5 Mar 2021", title: "Entrance Test", desc: "Completed the Class 1 readiness assessment.", icon: FileCheck2 },
  { date: "15 Mar 2021", title: "Admission Confirmed", desc: "Admission confirmed for Class 1, Academic Year 2021-22.", icon: CheckCircle2 },
  { date: "1 Apr 2021", title: "Section Allocated", desc: "Allocated to Class 1 - A, Vindhya House.", icon: Layers },
  { date: "2 Jun 2021", title: "First Attendance", desc: "Attended the first day of school.", icon: UserCheck },
  { date: "Apr 2022", title: "Promoted to Class 2", desc: "Promoted based on Term 3 assessment.", icon: GraduationCap },
  { date: "Apr 2023", title: "Promoted to Class 3", desc: "Promoted based on Term 3 assessment.", icon: GraduationCap },
  { date: "Feb 2024", title: "Winner - Inter-School Elocution Competition", desc: "Represented the school and won first place.", icon: Trophy },
  { date: "Apr 2024", title: "Promoted to Class 4", desc: "Promoted based on Term 3 assessment.", icon: GraduationCap },
  { date: "Apr 2025", title: "Promoted to Class 5", desc: "Promoted to Class 5 - A, roll number 1.", icon: GraduationCap },
  { date: "Jul 2026", title: "Best Academic Performance - Term 2", desc: "Recognized for top academic performance in Class 5 - A.", icon: Award },
];



const STUDENT_TIMETABLE = [
  { period: "1", time: "8:00 - 8:40 AM", subject: "Mathematics", teacher: "Mr. Sameer Khan" },
  { period: "2", time: "8:45 - 9:25 AM", subject: "English", teacher: "Ms. Ritu Chandra" },
  { period: "3", time: "9:30 - 10:10 AM", subject: "Science", teacher: "Mr. Sameer Khan" },
  { period: "4", time: "10:40 - 11:20 AM", subject: "Hindi", teacher: "Ms. Alka Dixit" },
  { period: "5", time: "11:25 - 12:05 PM", subject: "EVS", teacher: "Ms. Sneha Kulkarni" },
  { period: "6", time: "12:40 - 1:20 PM", subject: "Art", teacher: "Ms. Farah Ansari" },
];

const ASSIGNMENTS = [
  { id: "AS-1", subject: "Science", title: "Model of the solar system", status: "Pending", due: "In 4 days" },
  { id: "AS-2", subject: "English", title: "Book review - 'The Jungle Book'", status: "Submitted", due: "2 days ago" },
  { id: "AS-3", subject: "Mathematics", title: "Geometry shapes project", status: "Graded", grade: "A", due: "1 week ago" },
];

const PERFORMANCE_HISTORY = [
  { term: "Term 1", pct: 78 },
  { term: "Term 2", pct: 84 },
  { term: "Term 3 (current)", pct: 88 },
];

const EXAM_RESULTS = {
  term: "Term 3 Progress Report",
  subjects: [
    { subject: "Mathematics", marks: 46, max: 50, grade: "A+" },
    { subject: "Science", marks: 42, max: 50, grade: "A" },
    { subject: "English", marks: 44, max: 50, grade: "A+" },
    { subject: "Hindi", marks: 38, max: 50, grade: "B+" },
    { subject: "EVS", marks: 45, max: 50, grade: "A+" },
  ],
};

const EXAM_TERMS = ["Term 1", "Term 2", "Term 3"];
const EXAM_MAX_MARKS = 50;

function computeGrade(marks, max) {
  const pct = (marks / max) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  return "D";
}

const ACHIEVEMENTS = [
  { title: "1st Place - Inter-house Drawing Competition", date: "Mar 2026" },
  { title: "Best Attendance Award - Term 2", date: "Jul 2026" },
  { title: "Winner - School Chess Championship (U-9)", date: "Jan 2026" },
];

const CERTIFICATES = [
  { title: "Term 1 Progress Certificate", date: "Apr 2026" },
  { title: "Sports Day Participation Certificate", date: "Feb 2026" },
];

const TRANSPORT_INFO = { route: "Route 1 - Gomti Nagar", busNumber: "UP32 AB 4521", driver: "Mr. Sunil Yadav", pickupTime: "7:15 AM", dropTime: "2:30 PM", stop: "Gomti Nagar Extension, Sector 4" };

const LIBRARY_BOOKS = [
  { title: "Panchatantra Tales", author: "Vishnu Sharma", due: "28 Jul 2026", status: "Issued" },
  { title: "The Wonderful World of Insects", author: "R. Menon", due: "2 Aug 2026", status: "Issued" },
];

const SCHOOL_EVENTS = [
  { title: "Annual Sports Day", date: "2 Aug 2026" },
  { title: "Independence Day Celebration", date: "15 Aug 2026" },
  { title: "Term 3 Parent-Teacher Meeting", date: "22 Aug 2026" },
];

const SCHOOL_NOTICES_INITIAL = [
  { title: "School will remain closed on 15 Aug for Independence Day", date: "2 days ago" },
  { title: "Term 3 fee due date extended to 10 Oct", date: "5 days ago" },
  { title: "Annual Sports Day registrations now open", date: "1 week ago" },
];

const PTM_SLOTS = ["22 Aug, 10:00 AM", "22 Aug, 10:20 AM", "22 Aug, 11:00 AM", "22 Aug, 11:20 AM", "22 Aug, 2:00 PM"];

/* ---------------------------------------------------------
   PRINCIPAL DATA (school-wide aggregates)
--------------------------------------------------------- */

const REVENUE_TREND = [
  { term: "Feb", pct: 62 },
  { term: "Mar", pct: 70 },
  { term: "Apr", pct: 88 },
  { term: "May", pct: 74 },
  { term: "Jun", pct: 80 },
  { term: "Jul", pct: 91 },
];

const ATTENDANCE_TREND = [
  { term: "Wk 1", pct: 91 },
  { term: "Wk 2", pct: 89 },
  { term: "Wk 3", pct: 93 },
  { term: "Wk 4", pct: 87 },
  { term: "Wk 5", pct: 94 },
  { term: "Wk 6", pct: 92 },
];

const CLASS_STRENGTH = [
  { cls: "Nursery", strength: 68, capacity: 80 },
  { cls: "LKG", strength: 74, capacity: 80 },
  { cls: "UKG", strength: 71, capacity: 80 },
  { cls: "Class 1", strength: 112, capacity: 120 },
  { cls: "Class 2", strength: 108, capacity: 120 },
  { cls: "Class 3", strength: 96, capacity: 120 },
  { cls: "Class 4", strength: 88, capacity: 120 },
  { cls: "Class 5", strength: 79, capacity: 120 },
];

const DEFAULTERS = [
  { name: "Rohan Bajaj", cls: "Class 4 - B", due: 22500, daysOverdue: 46, parent: "Bajaj Family", phone: "+91 98765 43210" },
  { name: "Simran Kaur", cls: "Class 2 - A", due: 18000, daysOverdue: 31, parent: "Kaur Family", phone: "+91 91234 56789" },
  { name: "Aryan Mehta", cls: "Class 5 - B", due: 27000, daysOverdue: 58, parent: "Mehta Family", phone: "+91 99887 66554" },
  { name: "Fatima Sheikh", cls: "Class 1 - A", due: 15500, daysOverdue: 22, parent: "Sheikh Family", phone: "+91 90011 22334" },
  { name: "Karan Oberoi", cls: "Class 3 - B", due: 19800, daysOverdue: 39, parent: "Oberoi Family", phone: "+91 98123 45670" },
];

const TEACHERS_PERFORMANCE = [
  { name: "Mr. Sameer Khan", subject: "Mathematics", sections: 3, avgAttendance: 93, avgScore: 84, rating: 4.6 },
  { name: "Ms. Ritu Chandra", subject: "English", sections: 2, avgAttendance: 95, avgScore: 88, rating: 4.8 },
  { name: "Ms. Sneha Kulkarni", subject: "EVS", sections: 2, avgAttendance: 90, avgScore: 79, rating: 4.3 },
  { name: "Mr. Manoj Tiwari", subject: "Class 1 Class Teacher", sections: 1, avgAttendance: 88, avgScore: 76, rating: 4.1 },
  { name: "Ms. Alka Dixit", subject: "Hindi", sections: 2, avgAttendance: 91, avgScore: 81, rating: 4.5 },
];

const RISK_STUDENTS = [
  { name: "Rohan Bajaj", cls: "Class 4 - B", flags: ["Fee overdue 46 days", "Attendance 68%"] },
  { name: "Meera Krishnan", cls: "Class 2 - B", flags: ["Attendance 71%", "Declining grades"] },
  { name: "Aryan Mehta", cls: "Class 5 - B", flags: ["Fee overdue 58 days"] },
  { name: "Vivek Anand", cls: "Class 3 - A", flags: ["Attendance 69%", "Frequent late marks"] },
];

const TRANSFER_REQUESTS = [
  { name: "Neha Prasad", cls: "Class 4 - A", reason: "Family relocating to Kanpur", requestedOn: "5 days ago", status: "pending" },
  { name: "Aditya Ranjan", cls: "Class 2 - B", reason: "Transfer to CBSE school for board alignment", requestedOn: "2 weeks ago", status: "pending" },
  { name: "Ishaan Bhatia", cls: "Class 6 - A", reason: "Parent's job transfer", requestedOn: "1 month ago", status: "approved" },
];

/* ---------------------------------------------------------
   SUPER ADMIN / SCHOOL ADMIN DATA
--------------------------------------------------------- */

const SCHOOL_PLANS_INITIAL = {
  gvs: { plan: "Scale", mrr: 42000, status: "Active", renewal: "12 Jan 2027" },
  bfs: { plan: "Growth", mrr: 24000, status: "Active", renewal: "5 Mar 2027" },
  dps: { plan: "Scale", mrr: 58000, status: "Active", renewal: "20 Sep 2026" },
  sps: { plan: "Starter", mrr: 12000, status: "Trial", renewal: "1 Aug 2026" },
};

const PLAN_STUDENT_CAP = { Starter: 500, Growth: 1500, Scale: Infinity };

const INVOICES_INITIAL = [
  { id: "INV-1001", schoolId: "gvs", amount: 42000, issueDate: "12 Jul 2026", dueDate: "12 Aug 2026", status: "paid" },
  { id: "INV-1002", schoolId: "bfs", amount: 24000, issueDate: "5 Jul 2026", dueDate: "5 Aug 2026", status: "sent" },
  { id: "INV-1003", schoolId: "dps", amount: 58000, issueDate: "20 Jun 2026", dueDate: "20 Jul 2026", status: "overdue" },
  { id: "INV-1004", schoolId: "sps", amount: 12000, issueDate: "1 Jul 2026", dueDate: "1 Aug 2026", status: "paid" },
];

const STAFF_DIRECTORY_INITIAL = [
  { name: "Mr. Sameer Khan", role: "Teacher", subject: "Mathematics", email: "sameer.khan@greenvalley.edu", status: "Active" },
  { name: "Ms. Ritu Chandra", role: "Teacher", subject: "English", email: "ritu.chandra@greenvalley.edu", status: "Active" },
  { name: "Ms. Sneha Kulkarni", role: "Teacher", subject: "EVS", email: "sneha.kulkarni@greenvalley.edu", status: "Active" },
  { name: "Mr. Manoj Tiwari", role: "Teacher", subject: "Class 1", email: "manoj.tiwari@greenvalley.edu", status: "Active" },
  { name: "Ms. Alka Dixit", role: "Teacher", subject: "Hindi", email: "alka.dixit@greenvalley.edu", status: "Active" },
  { name: "Priya Sharma", role: "Admission Counselor", subject: "Admissions", email: "priya.sharma@greenvalley.edu", status: "Active" },
  { name: "Amit Kulkarni", role: "Admission Counselor", subject: "Admissions", email: "amit.kulkarni@greenvalley.edu", status: "Active" },
  { name: "Neha Singh", role: "Admission Counselor", subject: "Admissions", email: "neha.singh@greenvalley.edu", status: "On Leave" },
  { name: "Ritu Mathur", role: "Coordinator", subject: "Academics", email: "ritu.mathur@greenvalley.edu", status: "Active" },
  { name: "Dr. Anjali Mehra", role: "Principal", subject: "Administration", email: "principal@greenvalley.edu", status: "Active" },
];

const SECTION_MANAGER_DATA = [
  { cls: "Class 1", section: "A", teacher: "Mr. Manoj Tiwari", strength: 38, capacity: 40 },
  { cls: "Class 1", section: "B", teacher: "Ms. Ritu Chandra", strength: 36, capacity: 40 },
  { cls: "Class 2", section: "A", teacher: "Ms. Sneha Kulkarni", strength: 35, capacity: 40 },
  { cls: "Class 3", section: "A", teacher: "Mr. Sameer Khan", strength: 32, capacity: 40 },
  { cls: "Class 3", section: "B", teacher: "Mr. Sameer Khan", strength: 29, capacity: 40 },
  { cls: "Class 5", section: "A", teacher: "Ms. Alka Dixit", strength: 27, capacity: 40 },
];

const FEE_STRUCTURE_ADMIN_INITIAL = [
  { id: "FH1", head: "Tuition Fee", term: "Per term", amount: 18000 },
  { id: "FH2", head: "Transport Fee", term: "Per term", amount: 4000 },
  { id: "FH3", head: "Annual Activity Fee", term: "Annual", amount: 4500 },
  { id: "FH4", head: "Admission Fee", term: "One-time", amount: 15000 },
];

const TRANSPORT_ROUTES_INITIAL = [
  { id: "RT1", name: "Route 1 - Gomti Nagar", busNumber: "UP32 AB 4521", driver: "Mr. Sunil Yadav", capacity: 40, assigned: 34, stops: ["Gomti Nagar Extension", "Sector 4", "Vipin Khand"] },
  { id: "RT2", name: "Route 2 - Alambagh", busNumber: "UP32 AC 7710", driver: "Mr. Ramesh Chauhan", capacity: 40, assigned: 37, stops: ["Alambagh Bus Station", "Kanpur Road Crossing"] },
  { id: "RT3", name: "Route 3 - Indira Nagar", busNumber: "UP32 AD 2298", driver: "Mr. Devendra Singh", capacity: 35, assigned: 22, stops: ["Indira Nagar Sector C", "Faizabad Road"] },
  { id: "RT4", name: "Route 4 - Hazratganj", busNumber: "UP32 AE 5563", driver: "Mr. Anil Mishra", capacity: 35, assigned: 29, stops: ["Hazratganj Crossing", "GPO Chauraha"] },
];

const HOSTEL_BLOCKS_INITIAL = [
  { id: "HB1", name: "Boys Hostel - Block A", warden: "Mr. Ashok Tiwari", totalRooms: 40, occupiedRooms: 32, capacityPerRoom: 3 },
  { id: "HB2", name: "Girls Hostel - Block B", warden: "Ms. Kavita Nair", totalRooms: 35, occupiedRooms: 28, capacityPerRoom: 3 },
];

/* ---------------------------------------------------------
   UNIVERSAL STUDENT TIMELINE (demo child's full journey)
--------------------------------------------------------- */

const AARAV_MILESTONES = [
  { date: "12 Mar 2024", title: "Inquiry Created", desc: "Parent inquired about Nursery admission through the school website.", icon: ClipboardList },
  { date: "15 Mar 2024", title: "Parent Called", desc: "Counselor Priya Sharma called to walk through the admission process.", icon: PhoneCall },
  { date: "22 Mar 2024", title: "Campus Visit", desc: "Family toured the campus and met the Nursery wing coordinator.", icon: MapPin },
  { date: "2 Apr 2024", title: "Entrance Test", desc: "Completed the age-appropriate readiness assessment.", icon: FileCheck2 },
  { date: "10 Apr 2024", title: "Admission Confirmed", desc: "Admission confirmed for Nursery, Academic Year 2024-25.", icon: CheckCircle2 },
  { date: "15 Apr 2024", title: "Section Allocated", desc: "Allocated to Nursery - A, Aravalli House, class teacher Ms. Kavita Rawat.", icon: Layers },
  { date: "3 Jun 2024", title: "First Attendance", desc: "Attended the first day of school.", icon: UserCheck },
  { date: "Jan 2025", title: "Promoted to LKG", desc: "Promoted to LKG based on Term 3 assessment.", icon: GraduationCap },
  { date: "Jan 2026", title: "Winner - School Chess Championship (U-9)", desc: "Recognized for outstanding performance in the U-9 chess championship.", icon: Trophy },
  { date: "Apr 2026", title: "Promoted to Class 3", desc: "Promoted to Class 3 - A based on Term 3 performance, roll number 1.", icon: GraduationCap },
  { date: "Mar 2026", title: "1st Place - Inter-house Drawing Competition", desc: "Awarded first place representing Aravalli House.", icon: Trophy },
  { date: "Jul 2026", title: "Best Attendance Award - Term 2", desc: "Recognized for maintaining excellent attendance through Term 2.", icon: Award },
];

const CHILD_MILESTONES = {
  [CHILD.id]: AARAV_MILESTONES,
  [SIBLING.id]: DIYA_MILESTONES,
};

/* ---------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------- */

function StagePill({ stageId, compact }) {
  const idx = STAGES.findIndex((s) => s.id === stageId);
  const stage = STAGES[idx];
  const pct = (idx + 1) / STAGES.length;
  const hue = 250 - pct * 110; // indigo -> green as it progresses
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}
      style={{ background: `hsl(${hue} 70% 95%)`, color: `hsl(${hue} 55% 34%)` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: `hsl(${hue} 60% 45%)` }} />
      {stage.label}
    </span>
  );
}

const STUDENT_STATUS_STYLES = {
  "Inquiry": { bg: "#F1F5F9", fg: "#475569" },
  "Prospect": { bg: "#F1F5F9", fg: "#475569" },
  "Applicant": { bg: "#FEF3C7", fg: "#92400E" },
  "Approved": { bg: "#FEF3C7", fg: "#92400E" },
  "Enrolled": { bg: "#EEF2FF", fg: "#4338CA" },
  "Recently Enrolled": { bg: "#EEF2FF", fg: "#4338CA" },
  "Section Allocated": { bg: "#ECFEFF", fg: "#0E7490" },
  "Active Student": { bg: "#ECFDF5", fg: "#047857" },
  "Promoted": { bg: "#ECFDF5", fg: "#047857" },
  "Graduated": { bg: "#F5F3FF", fg: "#6D28D9" },
  "Transferred": { bg: "#FFF7ED", fg: "#C2410C" },
  "Withdrawn": { bg: "#FEF2F2", fg: "#B91C1C" },
  "Inactive": { bg: "#F1F5F9", fg: "#64748B" },
};

function StudentStatusPill({ status, compact }) {
  const s = STUDENT_STATUS_STYLES[status] || { bg: "#F1F5F9", fg: "#475569" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.fg }} />
      {status}
    </span>
  );
}

function Avatar({ name, size = 32 }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const colors = ["#4F46E5", "#0EA5A0", "#D97706", "#DB2777", "#2563EB", "#059669"];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, background: colors[idx], fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

// Reads a picked file into a data URL so it can be stored in memory and previewed immediately.
function readFileAsDataUrl(file, onLoad) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => onLoad(reader.result);
  reader.readAsDataURL(file);
}

// Shows a school's uploaded logo when present; otherwise falls back to the initials/color badge
// so schools that haven't set branding yet still render cleanly everywhere.
// Lets branding be set either via native file picker or by pasting an image URL —
// the URL path is a reliable fallback since sandboxed preview environments often
// block native file-picker dialogs from opening.
function BrandingField({ label, currentUrl, onChange }) {
  const [urlDraft, setUrlDraft] = useState("");
  return (
    <div>
      <label className="block text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg py-2 text-[12.5px] text-slate-500 dark:text-slate-400 cursor-pointer hover:border-indigo-300">
        {currentUrl ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => readFileAsDataUrl(e.target.files[0], onChange)}
        />
      </label>
      <div className="flex items-center gap-2 mt-2">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-[10.5px] text-slate-400 dark:text-slate-500">or paste an image URL</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="flex gap-1.5 mt-2">
        <input
          type="text"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="https://..."
          className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[12.5px] outline-none focus:border-indigo-300 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="button"
          onClick={() => { if (urlDraft.trim()) { onChange(urlDraft.trim()); setUrlDraft(""); } }}
          className="px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[12.5px] font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          Use
        </button>
      </div>
    </div>
  );
}

function SchoolLogo({ school, size = 40, rounded = "rounded-xl", className = "" }) {
  if (school.logoUrl) {
    return (
      <img
        src={school.logoUrl}
        alt={`${school.name} logo`}
        className={`${rounded} object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`${rounded} flex items-center justify-center font-semibold shrink-0 ${className}`}
      style={{ width: size, height: size, background: school.colorSoft, color: school.color, fontSize: size * 0.34 }}
    >
      {school.logo}
    </div>
  );
}

// Shows a school's uploaded banner image when present; otherwise falls back to the gradient swatch
// already used across the app so branding is optional, not required.
function SchoolBanner({ school, className = "" }) {
  if (school.bannerUrl) {
    return <img src={school.bannerUrl} alt={`${school.name} banner`} className={`${className} object-cover`} />;
  }
  return <div className={className} style={{ background: `linear-gradient(135deg, ${school.color}, ${school.color}99)` }} />;
}

/* ---------------------------------------------------------
   SCREEN 1: SCHOOL PICKER
--------------------------------------------------------- */

function BrowseSchoolsScreen({ schools, onViewProfile, onTrack, onBackHome }) {
  const [query, setQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [boardFilter, setBoardFilter] = useState("all");
  const [coords, setCoords] = useState(null);
  const [geoState, setGeoState] = useState("idle"); // idle | loading | done | error
  const [geoError, setGeoError] = useState("");

  const cities = useMemo(
    () => Array.from(new Set(schools.map((s) => s.cityName || s.city))).sort(),
    [schools]
  );
  const areas = useMemo(() => {
    const pool = cityFilter === "all" ? schools : schools.filter((s) => (s.cityName || s.city) === cityFilter);
    return Array.from(new Set(pool.map((s) => s.locality).filter(Boolean))).sort();
  }, [schools, cityFilter]);
  const boards = useMemo(() => Array.from(new Set(schools.map((s) => s.board))).sort(), [schools]);

  const withDistance = useMemo(
    () => schools.map((s) => ({ ...s, _dist: coords ? distanceKm(coords, s) : null })),
    [schools, coords]
  );

  const sorted = useMemo(() => {
    const list = [...withDistance];
    list.sort((a, b) => {
      if (coords) return (a._dist ?? 1e9) - (b._dist ?? 1e9);
      return b.rating - a.rating;
    });
    return list;
  }, [withDistance, coords]);

  const matchesText = (s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [s.name, s.city, s.cityName, s.locality, s.pincode, s.board]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  };

  const filtered = sorted.filter(
    (s) =>
      matchesText(s) &&
      (cityFilter === "all" || (s.cityName || s.city) === cityFilter) &&
      (areaFilter === "all" || s.locality === areaFilter) &&
      (boardFilter === "all" || s.board === boardFilter)
  );

  // When a city/area filter yields nothing, suggest the closest alternatives in that city.
  const nearbyFallback =
    filtered.length === 0 && cityFilter !== "all"
      ? sorted.filter((s) => (s.cityName || s.city) === cityFilter).slice(0, 3)
      : [];

  const hasFilters = cityFilter !== "all" || areaFilter !== "all" || boardFilter !== "all" || query.trim() !== "";
  const clearFilters = () => {
    setQuery("");
    setCityFilter("all");
    setAreaFilter("all");
    setBoardFilter("all");
  };

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("error");
      setGeoError("Your browser doesn't support location. Please pick your city below.");
      return;
    }
    setGeoState("loading");
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(me);
        setGeoState("done");
        // Auto-select the nearest city so the list feels local right away.
        let best = null;
        schools.forEach((s) => {
          const d = distanceKm(me, s);
          if (d != null && (!best || d < best.d)) best = { d, city: s.cityName || s.city };
        });
        if (best) {
          setCityFilter(best.city);
          setAreaFilter("all");
        }
      },
      (err) => {
        setGeoState("error");
        setGeoError(
          err && err.code === 1
            ? "Location permission denied. Select your city or area instead."
            : "Couldn't detect your location. Select your city or area instead."
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  const selectClass =
    "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-[13.5px] text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-300 shadow-sm";

  const renderCard = (s) => (
    <button
      key={s.id}
      onClick={() => onViewProfile(s)}
      className="group text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all"
    >
      <SchoolBanner school={s} className="h-16 w-full" />
      <div className="p-5 -mt-8">
        <div className="flex items-start justify-between">
          <SchoolLogo school={s} size={56} rounded="rounded-xl" className="border-4 border-white dark:border-slate-900 shadow-sm" />
          {s._dist != null && (
            <span className="mt-9 text-[11px] font-medium px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              {formatDistance(s._dist)}
            </span>
          )}
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-slate-900 dark:text-white text-[15px] truncate">{s.name}</div>
            <span className="text-[10.5px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">{s.board}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[13px] mt-1">
            <MapPin size={12} /> {s.locality ? `${s.locality}, ${s.cityName || s.city}` : s.city}
          </div>
          <div className="flex items-center gap-3 mt-2.5 text-[12px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" /> {s.rating}</span>
            <span>{s.students.toLocaleString()} students</span>
          </div>
          <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[12px] text-slate-500 dark:text-slate-400">{s.feeRange}</span>
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-[12.5px] font-medium group-hover:gap-1.5 transition-all">
              View school <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-14">
      <div className="w-full max-w-4xl mx-auto">
        <button onClick={onBackHome} className="flex items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 text-[13px] mb-6">
          <ChevronLeft size={15} /> Back to home
        </button>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-200">
            <School className="text-white" size={26} />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Vedaalay</h1>
          <p className="text-slate-400 dark:text-slate-500 text-[12px] mt-1">by Akash Duwedi</p>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-[15px] max-w-md">Find schools onboarded on Vedaalay near you — search by area, city, or use your current location.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-4">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by school name, area, city or pincode..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-[14px] text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-300"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-2.5 mt-3">
            <button
              onClick={useMyLocation}
              disabled={geoState === "loading"}
              className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[13.5px] font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {geoState === "loading" ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
              {geoState === "loading" ? "Detecting..." : coords ? "Location on" : "Use my location"}
            </button>
            <select
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setAreaFilter("all"); }}
              className={selectClass}
            >
              <option value="all">All cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className={selectClass}>
              <option value="all">All areas</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {["all", ...boards].map((b) => (
              <button
                key={b}
                onClick={() => setBoardFilter(b)}
                className={`text-[12px] font-medium px-2.5 py-1.5 rounded-full border transition-colors ${
                  boardFilter === b
                    ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {b === "all" ? "All boards" : b}
              </button>
            ))}
            {hasFilters && (
              <button onClick={clearFilters} className="text-[12px] text-slate-400 dark:text-slate-500 underline ml-1">
                Clear filters
              </button>
            )}
          </div>

          {geoError && (
            <div className="mt-3 flex items-start gap-2 text-[12.5px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> {geoError}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-5">
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-200">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "school" : "schools"}
            {cityFilter !== "all" && <> in {cityFilter}</>}
            {areaFilter !== "all" && <> &middot; {areaFilter}</>}
            {coords && <> &middot; nearest first</>}
          </p>
          <button onClick={onTrack} className="text-indigo-600 dark:text-indigo-400 text-[13px] font-medium">
            Track your inquiry &rarr;
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(renderCard)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl py-10 px-6">
            <MapPin size={22} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-slate-700 dark:text-slate-200 text-[14px] font-medium mt-3">No Vedaalay schools match this area yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-[13px] mt-1">Try a nearby area, another city, or clear your filters.</p>
            <button onClick={clearFilters} className="mt-4 text-[13px] font-medium px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
              Clear filters
            </button>
            {nearbyFallback.length > 0 && (
              <div className="mt-7 text-left">
                <p className="text-[12.5px] text-slate-400 dark:text-slate-500 mb-3">Other schools in {cityFilter}</p>
                <div className="grid sm:grid-cols-2 gap-4">{nearbyFallback.map(renderCard)}</div>
              </div>
            )}
          </div>
        )}


        <p className="text-center text-slate-400 dark:text-slate-500 text-[13px] mt-10">
          Prototype build &middot; realistic dummy data &middot; no data leaves this session
        </p>
        <p className="text-center text-slate-300 dark:text-slate-600 text-[12px] mt-2">
          Staff, teacher, or existing family?{" "}
          <button onClick={onBackHome} className="text-indigo-500 dark:text-indigo-400 font-medium">Sign in from the home screen</button>
        </p>
      </div>
    </div>
  );
}

function SchoolProfileScreen({ school, onEnquire, onGoToSignIn, onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SchoolBanner school={school} className="h-40 sm:h-52 w-full" />
      <div className="max-w-3xl mx-auto px-6">
        <button onClick={onBack} className="flex items-center gap-1 text-white -mt-32 mb-4 text-[13px] font-medium bg-black/20 hover:bg-black/30 rounded-lg px-2.5 py-1.5 w-fit backdrop-blur-sm">
          <ChevronLeft size={15} /> Back to all schools
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 -mt-4 relative shadow-sm">
          <div className="flex items-start gap-4">
            <SchoolLogo school={school} size={64} rounded="rounded-xl" className="shadow-sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{school.name}</h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{school.board}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[13.5px] mt-1">
                <MapPin size={13} /> {school.city}
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{school.rating}</span>
                <span className="text-[12px] text-slate-400 dark:text-slate-500">rating from parents</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-[14px] font-semibold text-slate-900 dark:text-white">{school.established}</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">Established</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-[14px] font-semibold text-slate-900 dark:text-white">{school.students.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">Students</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-[14px] font-semibold text-slate-900 dark:text-white">{school.principal.split(" ").slice(-1)[0]}</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">Principal</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mt-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-2.5">About the school</h3>
          <p className="text-slate-600 dark:text-slate-300 text-[13.5px] leading-relaxed">{school.about}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mt-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Facilities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SCHOOL_FACILITIES.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Icon size={15} />
                  </div>
                  <span className="text-[13px] text-slate-700 dark:text-slate-200">{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mt-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Fee range</h3>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <IndianRupee size={15} />
            </div>
            <span className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{school.feeRange}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mt-4 mb-6">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4 flex items-center gap-2"><Quote size={15} className="text-slate-300" /> What parents say</h3>
          <div className="space-y-4">
            {SCHOOL_TESTIMONIALS.map((t, idx) => (
              <div key={idx}>
                <p className="text-[13.5px] text-slate-700 dark:text-slate-200 italic">"{t.quote}"</p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">&mdash; {t.author}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 -mx-6 px-6 py-4">
          <div className="flex gap-2.5">
            <button
              onClick={() => onEnquire(school)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium"
            >
              Enquire Now
            </button>
          </div>
          <p className="text-center text-slate-400 dark:text-slate-500 text-[12px] mt-2.5">
            Already a family or staff member?{" "}
            <button onClick={onGoToSignIn} className="text-indigo-500 dark:text-indigo-400 font-medium">Sign in from the home screen</button>
          </p>
        </div>
      </div>
    </div>
  );
}

function EnquiryFormScreen({ school, onSubmit, onBack }) {
  const [form, setForm] = useState({ student: "", classApplied: CLASSES_APPLIED[0], parentName: "", phone: "", email: "", visitDate: "", message: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.student.trim() && form.parentName.trim() && form.phone.trim();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-10">
      <div className="max-w-lg mx-auto">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[13px] font-medium mb-5">
          <ChevronLeft size={15} /> Back to {school.name}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <SchoolLogo school={school} size={44} rounded="rounded-xl" />
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Enquire at {school.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[13px]">Takes less than 2 minutes</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Student name</label>
            <input value={form.student} onChange={set("student")} placeholder="e.g. Aarav Gupta" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Class applying for</label>
            <select value={form.classApplied} onChange={set("classApplied")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13.5px] bg-white dark:bg-slate-900 outline-none focus:border-indigo-300 dark:text-slate-100">
              {CLASSES_APPLIED.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Parent / guardian name</label>
            <input value={form.parentName} onChange={set("parentName")} placeholder="e.g. Rohan Gupta" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Phone</label>
              <input value={form.phone} onChange={set("phone")} placeholder="+91 90000 00000" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Email (optional)</label>
              <input value={form.email} onChange={set("email")} placeholder="you@example.com" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Preferred visit date (optional)</label>
            <input type="date" value={form.visitDate} onChange={set("visitDate")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Message (optional)</label>
            <textarea value={form.message} onChange={set("message")} rows={2} placeholder="Anything you'd like the counselor to know" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 resize-none dark:text-slate-100" />
          </div>

          <button
            disabled={!canSubmit}
            onClick={() => onSubmit(form)}
            className={`w-full rounded-lg py-3 text-[13.5px] font-medium mt-2 ${canSubmit ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}
          >
            Submit Enquiry
          </button>
        </div>
      </div>
    </div>
  );
}

function EnquiryConfirmationScreen({ school, referenceId, onTrack, onBrowse }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-6 py-10">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-7 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={26} />
        </div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Enquiry submitted!</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-1.5">Your enquiry to {school.name} has been received.</p>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 mt-5">
          <div className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">Reference number</div>
          <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide mt-0.5">{referenceId}</div>
          <div className="text-[11.5px] text-slate-400 dark:text-slate-500 mt-1">Save this to track your application status</div>
        </div>

        <div className="text-left mt-6 space-y-3">
          <div className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">What happens next</div>
          {[
            "A counselor reviews your enquiry, usually within 24-48 hours.",
            "You'll receive a call to schedule a campus visit and discuss next steps.",
            "Track your status anytime using your reference number above.",
          ].map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[11px] font-semibold shrink-0 mt-0.5">{idx + 1}</div>
              <p className="text-[13px] text-slate-600 dark:text-slate-300">{step}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2.5 mt-7">
          <button onClick={onBrowse} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 text-[13.5px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            Browse other schools
          </button>
          <button onClick={onTrack} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium">
            Track my inquiry
          </button>
        </div>
      </div>
    </div>
  );
}

function TrackInquiryScreen({ inquiries, onBack }) {
  const [refInput, setRefInput] = useState("");
  const [searched, setSearched] = useState(false);
  const found = inquiries.find((i) => i.id.toLowerCase() === refInput.trim().toLowerCase());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-10">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[13px] font-medium mb-5">
          <ChevronLeft size={15} /> Back to all schools
        </button>

        <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-1.5">Track your inquiry</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mb-5">Enter the reference number you received after submitting your enquiry.</p>

        <div className="flex gap-2 mb-6">
          <input
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            placeholder="e.g. INQ-4821"
            className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100 bg-white dark:bg-slate-900"
          />
          <button
            onClick={() => setSearched(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 text-[13.5px] font-medium"
          >
            Track
          </button>
        </div>

        {searched && !found && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center">
            <AlertCircle size={22} className="text-amber-500 mx-auto mb-2" />
            <p className="text-[13.5px] text-slate-600 dark:text-slate-300">We couldn't find an inquiry with that reference number. Double-check and try again.</p>
          </div>
        )}

        {found && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Avatar name={found.student} size={40} />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white text-[15px]">{found.student}</div>
                <div className="text-slate-500 dark:text-slate-400 text-[13px]">{found.classApplied} applicant</div>
              </div>
            </div>
            <div className="mb-5"><StagePill stageId={found.stage} /></div>

            <div className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mb-2.5 uppercase tracking-wide">Progress</div>
            <div className="flex flex-col mb-5">
              {STAGES.map((s, idx) => {
                const stageIdx = STAGES.findIndex((x) => x.id === found.stage);
                const done = idx <= stageIdx;
                const isLast = idx === STAGES.length - 1;
                return (
                  <div key={s.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"}`}>
                        {done && <CheckCircle2 size={11} className="text-white" />}
                      </div>
                      {!isLast && <div className={`w-0.5 h-5 ${idx < stageIdx ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"}`} />}
                    </div>
                    <span className={`text-[13px] pb-4 ${done ? "text-slate-800 dark:text-slate-100 font-medium" : "text-slate-400 dark:text-slate-500"}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-[12.5px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
              Assigned counselor: <span className="text-slate-700 dark:text-slate-200 font-medium">{found.counselor}</span> &middot; Last activity: {found.lastActivity}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SCREEN 2: ROLE LOGIN
--------------------------------------------------------- */

function LandingScreen({ onFind, onFamily, onStaff, onSuperAdmin }) {
  const ENTRY_CARDS = [
    { icon: Search, title: "Find a School", desc: "Browse onboarded schools, view profiles, and enquire — no account needed.", onClick: onFind },
    { icon: Users, title: "Family Sign In", desc: "For parents and students to sign in to their school.", onClick: onFamily },
    { icon: Building2, title: "School Staff Sign In", desc: "For counselors, coordinators, teachers, principals, and school admins.", onClick: onStaff },
  ];
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-9">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-200">
            <School className="text-white" size={26} />
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Vedaalay</h1>
          <p className="text-slate-400 dark:text-slate-500 text-[12px] mt-1">by Akash Duwedi</p>
        </div>

        <div className="space-y-3">
          {ENTRY_CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.title}
                onClick={c.onClick}
                className="w-full flex items-center gap-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 hover:border-indigo-300 hover:shadow-md transition-all text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Icon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 dark:text-white text-[14.5px]">{c.title}</div>
                  <div className="text-slate-400 dark:text-slate-500 text-[12px] mt-0.5">{c.desc}</div>
                </div>
                <ArrowRight size={16} className="text-slate-300 shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <button onClick={onSuperAdmin} className="text-slate-300 dark:text-slate-600 hover:text-slate-400 text-[11.5px]">
            Super Admin
          </button>
        </div>
      </div>
    </div>
  );
}

function SchoolPickerScreen({ schools, title, subtitle, onPick, onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[13px] mb-6">
          <ChevronLeft size={15} /> Back to home
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-5">{subtitle}</p>
        <div className="space-y-2">
          {schools.map((s) => (
            <button
              key={s.id}
              onClick={() => onPick(s)}
              className="w-full flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 hover:border-slate-300 hover:shadow-sm transition-all text-left"
            >
              <SchoolLogo school={s} size={36} rounded="rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-900 dark:text-white text-[14px] truncate">{s.name}</div>
                <div className="text-slate-400 dark:text-slate-500 text-[12px]">{s.city}</div>
              </div>
              <ArrowRight size={15} className="text-slate-300 shrink-0" />
            </button>
          ))}
          {schools.length === 0 && (
            <p className="text-center text-slate-400 dark:text-slate-500 text-[13px] py-6">No onboarded schools yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SuperAdminLoginScreen({ onBack, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError || !data.user) {
      setLoading(false);
      setError("Incorrect email or password.");
      return;
    }
    const profile = await fetchProfile(data.user.id);
    setLoading(false);
    if (!profile || profile.role !== "superadmin") {
      await supabase.auth.signOut();
      setError("This account doesn't have Super Admin access.");
      return;
    }
    onLogin();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 text-[13px] mb-6">
          <ChevronLeft size={15} /> Back to home
        </button>
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Building2 size={17} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Super Admin login</h2>
        </div>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3.5 py-2.5 text-[13px] text-rose-700 dark:text-rose-300">
            <AlertCircle size={15} className="shrink-0" /> {error}
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="you@vedaalay.com"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg py-2.5 font-medium text-[14px] transition-colors mt-2 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Signing in..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Demo accounts seeded in the backend, surfaced on the login screen so the
// credentials are discoverable while the product is in demo mode.
const DEMO_PASSWORD = "Vedaalay@2026";
const DEMO_LOGINS = {
  superadmin: { email: "superadmin@vedaalay.com", password: "Vedaalay@Admin2026" },
  admin: { email: "admin@vedaalay.com", password: DEMO_PASSWORD },
  principal: { email: "principal@vedaalay.com", password: DEMO_PASSWORD },
  coordinator: { email: "coordinator@vedaalay.com", password: DEMO_PASSWORD },
  teacher: { email: "teacher@vedaalay.com", password: DEMO_PASSWORD },
  counselor: { email: "counselor@vedaalay.com", password: DEMO_PASSWORD },
  receptionist: { email: "reception@vedaalay.com", password: DEMO_PASSWORD },
  accounts: { email: "accounts@vedaalay.com", password: DEMO_PASSWORD },
  hr: { email: "hr@vedaalay.com", password: DEMO_PASSWORD },
  parent: { email: "parent@vedaalay.com", password: DEMO_PASSWORD },
  student: { email: "student@vedaalay.com", password: DEMO_PASSWORD },
};

function RoleLogin({ school, roles, onLogin, onBack }) {

  const [role, setRole] = useState(null);
  const [step, setStep] = useState("pick"); // pick -> credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(authService.getRemember());
  const [resetNote, setResetNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const roleOptions = roles || ROLES;

  async function handleForgotPassword() {
    setError("");
    setResetNote("");
    if (!email.trim()) {
      setError("Enter your email first, then tap Forgot password.");
      return;
    }
    setLoading(true);
    const { error: resetError } = await authService.requestPasswordReset(email);
    setLoading(false);
    if (resetError) {
      setError(resetError);
      return;
    }
    setResetNote("If that email has an account, a reset link is on its way.");
  }

  async function handleSubmit() {
    setError("");
    setResetNote("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    // Only enforce the school guard when the picker school is a real tenant id
    // (demo/mock schools use short ids like "s1" and would otherwise block login).
    const isTenantId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(school?.id ?? ""));
    const { profile, error: authError } = await authService.signIn({
      email,
      password,
      expectedRole: role.id,
      expectedSchoolId: isTenantId ? school.id : undefined,
      remember,
    });

    setLoading(false);
    if (authError || !profile) {
      setError(authError || "Unable to sign in.");
      return;
    }
    onLogin(ROLE_BY_ID[profile.role] || role);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 text-[13px] mb-6">
          <ChevronLeft size={15} /> Change school
        </button>

        <div className="flex items-center gap-3 mb-8">
          <SchoolLogo school={school} size={44} rounded="rounded-xl" />
          <div>
            <div className="font-semibold text-slate-900 dark:text-white text-[15px] leading-tight">{school.name}</div>
            <div className="text-slate-500 dark:text-slate-400 text-[13px]">{school.city}</div>
          </div>
        </div>

        {step === "pick" && (
          <>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Sign in as</h2>
            <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-5">Choose your role to continue</p>
            <div className="space-y-2">
              {roleOptions.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => { setRole(r); setStep("credentials"); setError(""); }}
                    className="w-full flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 hover:border-slate-300 hover:shadow-sm transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                      <Icon size={17} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white text-[14px]">{r.label}</div>
                      <div className="text-slate-400 dark:text-slate-500 text-[12px]">{r.desc}</div>
                    </div>
                    <ArrowRight size={15} className="text-slate-300 ml-auto shrink-0" />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === "credentials" && role && (
          <div>
            <button onClick={() => { setStep("pick"); setError(""); }} className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 text-[13px] mb-5">
              <ChevronLeft size={15} /> Choose a different role
            </button>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <role.icon size={17} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{role.label} login</h2>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3.5 py-2.5 text-[13px] text-rose-700 dark:text-rose-300">
                <AlertCircle size={15} className="shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="you@school.edu"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                />
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 accent-indigo-600"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </button>
              </div>
              {resetNote && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[13px] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {resetNote}
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg py-2.5 font-medium text-[14px] transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? "Signing in..." : "Continue"}
              </button>
              {DEMO_LOGINS[role.id] && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-[12.5px] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <div className="font-medium text-slate-700 dark:text-slate-200 mb-1">Demo account</div>
                  <div className="font-mono text-[12px] break-all">{DEMO_LOGINS[role.id].email}</div>
                  <div className="font-mono text-[12px]">{DEMO_LOGINS[role.id].password}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(DEMO_LOGINS[role.id].email);
                      setPassword(DEMO_LOGINS[role.id].password);
                      setError("");
                    }}
                    className="mt-2 text-[12.5px] font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Use these credentials
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

  );
}

/* ---------------------------------------------------------
   APP SHELL (sidebar + topbar)
--------------------------------------------------------- */

function AppShell({ school, role, active, onNavigate, onLogout, children, navItems, personName, darkMode, onToggleDark, searchIndex, onSelectSearchResult, searchPlaceholder, notifications, onSelectNotification }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = searchQuery.trim().length > 0
    ? (searchIndex || []).filter((item) =>
        (item.title + " " + (item.subtitle || "")).toLowerCase().includes(searchQuery.trim().toLowerCase())
      ).slice(0, 6)
    : [];
  const nav = navItems || [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "funnel", label: "Admission Funnel", icon: TrendingUp },
    { id: "inquiries", label: "All Inquiries", icon: ClipboardList },
    { id: "calendar", label: "Calendar", icon: Calendar },
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
    <style>{`
      .dark .dark\\:bg-slate-700 { background-color: #334155; }
      .dark .dark\\:bg-slate-700\\/70 { background-color: rgba(51,65,85,0.7); }
      .dark .dark\\:bg-slate-800 { background-color: #1e293b; }
      .dark .dark\\:bg-slate-900 { background-color: #0f172a; }
      .dark .dark\\:bg-slate-950 { background-color: #020617; }
      .dark .dark\\:bg-indigo-500\\/15 { background-color: rgba(99,102,241,0.15); }
      .dark .dark\\:bg-emerald-500\\/15 { background-color: rgba(16,185,129,0.15); }
      .dark .dark\\:bg-teal-500\\/15 { background-color: rgba(20,184,166,0.15); }
      .dark .dark\\:border-slate-700 { border-color: #334155; }
      .dark .dark\\:border-slate-800 { border-color: #1e293b; }
      .dark .dark\\:border-slate-900 { border-color: #0f172a; }
      .dark .dark\\:divide-slate-800 > :not([hidden]) ~ :not([hidden]) { border-color: #1e293b; }
      .dark .dark\\:text-white { color: #ffffff; }
      .dark .dark\\:text-slate-100 { color: #f1f5f9; }
      .dark .dark\\:text-slate-200 { color: #e2e8f0; }
      .dark .dark\\:text-slate-300 { color: #cbd5e1; }
      .dark .dark\\:text-slate-400 { color: #94a3b8; }
      .dark .dark\\:text-slate-500 { color: #64748b; }
      .dark .dark\\:text-slate-600 { color: #475569; }
      .dark .dark\\:text-indigo-400 { color: #818cf8; }
      .dark .dark\\:text-emerald-400 { color: #34d399; }
      .dark .dark\\:text-teal-400 { color: #2dd4bf; }
      .dark .dark\\:hover\\:bg-slate-800:hover { background-color: #1e293b; }
      .dark .dark\\:focus\\:bg-slate-800:focus { background-color: #1e293b; }
      .dark .dark\\:focus\\:border-indigo-500:focus { border-color: #6366f1; }
    `}</style>    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 lg:w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-100 dark:border-slate-800">
          <SchoolLogo school={school} size={32} rounded="rounded-lg" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-900 dark:text-white text-[13px] leading-tight truncate">{school.name}</div>
            <div className="text-slate-400 dark:text-slate-500 text-[11px]">{role.label}</div>
          </div>
          <button onClick={() => setMobileNavOpen(false)} className="lg:hidden w-7 h-7 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
            <X size={15} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {nav.map((n) => {
            const Icon = n.icon;
            const isActive = active === n.id;
            return (
              <button
                key={n.id}
                onClick={() => { onNavigate(n.id); setMobileNavOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                  isActive ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={16} />
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
          <button
            onClick={onToggleDark}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />} {darkMode ? "Light mode" : "Dark mode"}
          </button>
          <button onClick={() => setSettingsOpen(true)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Settings size={16} /> Settings
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
            <LogOut size={16} /> Sign out
          </button>
          <div className="px-3 pt-2 text-[10.5px] text-slate-300 dark:text-slate-600">Vedaalay by Akash Duwedi</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button onClick={() => setMobileNavOpen(true)} className="lg:hidden w-9 h-9 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
              <Menu size={18} />
            </button>
            <div className="relative flex-1 min-w-0 max-w-80 hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder || "Search..."}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-[13.5px] text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-300 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800"
              />
              {searchQuery.trim().length > 0 && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setSearchQuery("")} />
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-30 overflow-hidden max-h-80 overflow-y-auto">
                    {searchResults.length === 0 && (
                      <div className="px-4 py-4 text-[13px] text-slate-400 dark:text-slate-500">No results for "{searchQuery}"</div>
                    )}
                    {searchResults.map((r, idx) => (
                      <button
                        key={idx}
                        onClick={() => { onSelectSearchResult(r); setSearchQuery(""); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left border-b border-slate-50 dark:border-slate-800 last:border-0"
                      >
                        <Avatar name={r.title} size={28} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100 truncate">{r.title}</div>
                          {r.subtitle && <div className="text-[11.5px] text-slate-400 dark:text-slate-500 truncate">{r.subtitle}</div>}
                        </div>
                        <span className="text-[10.5px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shrink-0">{r.typeLabel}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative w-9 h-9 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0"
              >
                <Bell size={17} />
                {(notifications || []).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setNotifOpen(false)} />
                  <div className="absolute top-full right-0 mt-1.5 w-80 max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-30 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">Notifications</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {(notifications || []).length === 0 && (
                        <div className="px-4 py-6 text-center text-[13px] text-slate-400 dark:text-slate-500">You're all caught up.</div>
                      )}
                      {(notifications || []).map((n, idx) => {
                        const Icon = n.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => { onSelectNotification(n); setNotifOpen(false); }}
                            className="w-full flex items-start gap-2.5 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left border-b border-slate-50 dark:border-slate-800 last:border-0"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: n.tint + "1a", color: n.tint }}>
                              <Icon size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{n.title}</div>
                              {n.subtitle && <div className="text-[11.5px] text-slate-400 dark:text-slate-500 mt-0.5">{n.subtitle}</div>}
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg py-1 pr-1.5"
              >
                <Avatar name={personName || role.label} size={30} />
                <div className="hidden sm:block text-left">
                  <div className="text-[13px] font-medium text-slate-900 dark:text-white leading-tight">
                    {personName || role.label}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">{role.label}</div>
                </div>
                <ChevronDown size={14} className={`text-slate-400 hidden sm:block transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute top-full right-0 mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-30 overflow-hidden">
                    <div className="px-3.5 py-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-[13px] font-medium text-slate-900 dark:text-white">{personName || role.label}</div>
                      <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{role.label} &middot; {school.name}</div>
                    </div>
                    <button
                      onClick={() => { setSettingsOpen(true); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                    >
                      <Settings size={14} /> Account settings
                    </button>
                    <button
                      onClick={() => { onToggleDark(); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                    >
                      {darkMode ? <Sun size={14} /> : <Moon size={14} />} {darkMode ? "Light mode" : "Dark mode"}
                    </button>
                    <button
                      onClick={() => { onLogout(); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-left border-t border-slate-100 dark:border-slate-800"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>

    {settingsOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSettingsOpen(false)} />
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[15px]">Account Settings</h3>
            <button onClick={() => setSettingsOpen(false)} className="w-8 h-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400">
              <X size={16} />
            </button>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <Avatar name={personName || role.label} size={44} />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white text-[15px]">{personName || role.label}</div>
                <div className="text-slate-500 dark:text-slate-400 text-[13px]">{role.label} &middot; {school.name}</div>
              </div>
            </div>

            <div className="space-y-3 mb-2">
              <div>
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Display name</label>
                <input defaultValue={personName || role.label} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Email</label>
                <input defaultValue={`${(personName || role.label).toLowerCase().replace(/[^a-z]/g, ".")}@${school.name.toLowerCase().replace(/[^a-z]/g, "")}.edu`} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:bg-slate-800 dark:text-slate-100" />
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800 mt-3">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 text-[13.5px] font-medium">
                {darkMode ? <Sun size={16} /> : <Moon size={16} />} Dark mode
              </div>
              <button
                onClick={onToggleDark}
                className={`w-11 h-6 rounded-full relative transition-colors ${darkMode ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 text-[13.5px] font-medium">
                <Bell size={16} /> Email notifications
              </div>
              <button className="w-11 h-6 rounded-full relative bg-indigo-600">
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow translate-x-5" />
              </button>
            </div>

            <button
              onClick={() => setSettingsOpen(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium mt-5"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

/* ---------------------------------------------------------
   KPI CARD
--------------------------------------------------------- */

function KpiCard({ label, value, sub, icon: Icon, tint }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: tint + "1a", color: tint }}>
          <Icon size={16} />
        </div>
      </div>
      <div className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{value}</div>
      <div className="text-slate-500 dark:text-slate-400 text-[13px] mt-0.5">{label}</div>
      {sub && <div className="text-[12px] mt-1.5 font-medium" style={{ color: tint }}>{sub}</div>}
    </div>
  );
}

/* ---------------------------------------------------------
   COUNSELOR DASHBOARD
--------------------------------------------------------- */

function CounselorDashboard({ inquiries, onOpenInquiry, onNavigate, school }) {
  const total = inquiries.length;
  const confirmed = inquiries.filter((i) => i.stage === "confirmed").length;
  const conversion = total ? Math.round((confirmed / total) * 100) : 0;
  const todaysFollowUps = inquiries.filter((i) => i.createdDaysAgo <= 1).slice(0, 5);
  const pendingCalls = inquiries.filter((i) => i.stage === "new" || i.stage === "contacted").slice(0, 5);
  const recent = [...inquiries].sort((a, b) => a.createdDaysAgo - b.createdDaysAgo).slice(0, 6);

  const funnelCounts = STAGES.map((s) => ({
    ...s,
    count: inquiries.filter((i) => i.stage === s.id).length,
  }));
  const maxCount = Math.max(...funnelCounts.map((f) => f.count), 1);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Good morning, Priya</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Here's what needs your attention today at {school.name}</p>
        </div>
        <button
          onClick={() => onNavigate("newInquiry")}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-2 text-[13.5px] font-medium"
        >
          <Plus size={15} /> New Inquiry
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total inquiries" value={total} icon={ClipboardList} tint="#4F46E5" />
        <KpiCard label="Pending calls" value={pendingCalls.length} icon={Phone} tint="#D97706" />
        <KpiCard label="Meetings today" value={todaysFollowUps.length} icon={Calendar} tint="#0EA5A0" />
        <KpiCard label="Conversion rate" value={`${conversion}%`} sub="+4% vs last month" icon={TrendingUp} tint="#059669" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Funnel snapshot */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px]">Admission funnel</h3>
            <button onClick={() => onNavigate("funnel")} className="text-indigo-600 text-[13px] font-medium flex items-center gap-1">
              View board <ArrowRight size={13} />
            </button>
          </div>
          <div className="space-y-2.5">
            {funnelCounts.map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <div className="w-32 text-[12.5px] text-slate-500 dark:text-slate-400 shrink-0 truncate">{f.label}</div>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${(f.count / maxCount) * 100}%`, opacity: 0.4 + 0.6 * (f.count / maxCount) }}
                  />
                </div>
                <div className="w-6 text-right text-[12.5px] font-medium text-slate-700 dark:text-slate-200">{f.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's follow ups */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Today's follow-ups</h3>
          <div className="space-y-3">
            {todaysFollowUps.length === 0 && (
              <p className="text-slate-400 dark:text-slate-500 text-[13px]">No follow-ups scheduled for today.</p>
            )}
            {todaysFollowUps.map((i) => (
              <button key={i.id} onClick={() => onOpenInquiry(i)} className="w-full flex items-center gap-2.5 text-left group">
                <Avatar name={i.student} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600">{i.student}</div>
                  <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{i.classApplied}</div>
                </div>
                <StagePill stageId={i.stage} compact />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pending calls */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Pending calls</h3>
          <div className="space-y-1">
            {pendingCalls.map((i) => (
              <button
                key={i.id}
                onClick={() => onOpenInquiry(i)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
              >
                <Avatar name={i.student} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{i.student}</div>
                  <div className="text-[12px] text-slate-400 dark:text-slate-500">{i.phone}</div>
                </div>
                <span className="text-[11.5px] text-slate-400 dark:text-slate-500">{i.lastActivity}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent inquiries */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Recent inquiries</h3>
          <div className="space-y-1">
            {recent.map((i) => (
              <button
                key={i.id}
                onClick={() => onOpenInquiry(i)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
              >
                <Avatar name={i.student} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{i.student}</div>
                  <div className="text-[12px] text-slate-400 dark:text-slate-500">{i.classApplied} &middot; {i.source}</div>
                </div>
                <StagePill stageId={i.stage} compact />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   KANBAN FUNNEL BOARD
--------------------------------------------------------- */

function FunnelBoard({ inquiries, onOpenInquiry, onMoveStage, onNavigate }) {
  const [dragId, setDragId] = useState(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Admission Funnel</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Drag a card to move it to the next stage</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Filter size={14} /> Filter
          </button>
          <button
            onClick={() => onNavigate("newInquiry")}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-2 text-[13.5px] font-medium"
          >
            <Plus size={15} /> New Inquiry
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const items = inquiries.filter((i) => i.stage === stage.id);
          return (
            <div
              key={stage.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) onMoveStage(dragId, stage.id);
                setDragId(null);
              }}
              className="w-64 shrink-0 bg-slate-100 dark:bg-slate-700/70 rounded-2xl p-2.5"
            >
              <div className="flex items-center justify-between px-1.5 py-1.5 mb-1">
                <span className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-300">{stage.label}</span>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-full px-1.5 py-0.5">{items.length}</span>
              </div>
              <div className="space-y-2 min-h-[40px]">
                {items.map((i) => (
                  <div
                    key={i.id}
                    draggable
                    onDragStart={() => setDragId(i.id)}
                    onClick={() => onOpenInquiry(i)}
                    className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar name={i.student} size={26} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100 truncate">{i.student}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">{i.classApplied}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{i.counselor.split(" ")[0]}</span>
                      <span>{i.lastActivity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ALL INQUIRIES TABLE
--------------------------------------------------------- */

function InquiriesTable({ inquiries, onOpenInquiry, onNavigate }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">All Inquiries</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">{inquiries.length} total inquiries</p>
        </div>
        <button
          onClick={() => onNavigate("newInquiry")}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-2 text-[13.5px] font-medium"
        >
          <Plus size={15} /> New Inquiry
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[12px] text-slate-400 dark:text-slate-500">
              <th className="font-medium px-4 py-3">Student</th>
              <th className="font-medium px-4 py-3">Class applied</th>
              <th className="font-medium px-4 py-3">Stage</th>
              <th className="font-medium px-4 py-3">Counselor</th>
              <th className="font-medium px-4 py-3">Source</th>
              <th className="font-medium px-4 py-3">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((i) => (
              <tr
                key={i.id}
                onClick={() => onOpenInquiry(i)}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={i.student} size={28} />
                    <div>
                      <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{i.student}</div>
                      <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{i.parentName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{i.classApplied}</td>
                <td className="px-4 py-3"><StagePill stageId={i.stage} compact /></td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{i.counselor}</td>
                <td className="px-4 py-3 text-[13px] text-slate-500 dark:text-slate-400">{i.source}</td>
                <td className="px-4 py-3 text-[13px] text-slate-400 dark:text-slate-500">{i.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   INQUIRY DETAIL DRAWER
--------------------------------------------------------- */

function InquiryDrawer({ inquiry, onClose, onMoveStage }) {
  const [photoPreview, setPhotoPreview] = useState(null);
  if (!inquiry) return null;
  const stageIdx = STAGES.findIndex((s) => s.id === inquiry.stage);
  const nextStage = STAGES[stageIdx + 1];
  const willConfirm = nextStage && nextStage.id === "confirmed";

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
          <span className="text-[12.5px] text-slate-400 dark:text-slate-500 font-medium">{inquiry.id}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={inquiry.student} size={44} />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-[16px]">{inquiry.student}</div>
              <div className="text-slate-500 dark:text-slate-400 text-[13px]">{inquiry.classApplied} applicant</div>
            </div>
          </div>

          <StagePill stageId={inquiry.stage} />

          {/* Journey rail */}
          <div className="mt-5 mb-6">
            <div className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mb-2.5 uppercase tracking-wide">Journey progress</div>
            <div className="flex flex-col gap-0">
              {STAGES.map((s, idx) => {
                const done = idx <= stageIdx;
                const isLast = idx === STAGES.length - 1;
                return (
                  <div key={s.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-indigo-600" : "bg-slate-200"}`}>
                        {done && <CheckCircle2 size={11} className="text-white" />}
                      </div>
                      {!isLast && <div className={`w-0.5 h-5 ${idx < stageIdx ? "bg-indigo-600" : "bg-slate-200"}`} />}
                    </div>
                    <span className={`text-[13px] pb-4 ${done ? "text-slate-800 dark:text-slate-100 font-medium" : "text-slate-400 dark:text-slate-500"}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {willConfirm && (
            <div className="mb-4 border border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/20 rounded-xl p-3">
              <div className="text-[12px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-2">Student photo for ID card</div>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={18} className="text-indigo-400" />
                  )}
                </div>
                <label className="flex-1 cursor-pointer text-[12.5px] text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 rounded-lg px-3 py-2 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center gap-1.5">
                  <Paperclip size={13} /> {photoPreview ? "Change photo" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => setPhotoPreview(ev.target.result);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">A recent passport-style photo will be printed on the student's ID card.</p>
            </div>
          )}

          {nextStage && (
            <button
              onClick={() => onMoveStage(inquiry.id, nextStage.id, willConfirm ? { photo: photoPreview } : undefined)}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {willConfirm ? "Confirm admission & generate ID card" : `Move to "${nextStage.label}"`} <ArrowRight size={14} />
            </button>
          )}

          {/* Contact info */}
          <div className="space-y-2.5 mb-6">
            <div className="flex items-center gap-2.5 text-[13px] text-slate-600 dark:text-slate-300">
              <Users size={14} className="text-slate-400 dark:text-slate-500" /> {inquiry.parentName}
            </div>
            <div className="flex items-center gap-2.5 text-[13px] text-slate-600 dark:text-slate-300">
              <Phone size={14} className="text-slate-400 dark:text-slate-500" /> {inquiry.phone}
            </div>
            <div className="flex items-center gap-2.5 text-[13px] text-slate-600 dark:text-slate-300">
              <Mail size={14} className="text-slate-400 dark:text-slate-500" /> {inquiry.email}
            </div>
            <div className="flex items-center gap-2.5 text-[13px] text-slate-600 dark:text-slate-300">
              <Star size={14} className="text-slate-400 dark:text-slate-500" /> Source: {inquiry.source}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button className="flex flex-col items-center gap-1.5 border border-slate-200 dark:border-slate-700 rounded-xl py-3 hover:bg-slate-50 dark:hover:bg-slate-800">
              <PhoneCall size={16} className="text-indigo-600" />
              <span className="text-[11.5px] font-medium text-slate-600 dark:text-slate-300">Log call</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 border border-slate-200 dark:border-slate-700 rounded-xl py-3 hover:bg-slate-50 dark:hover:bg-slate-800">
              <CalendarCheck size={16} className="text-indigo-600" />
              <span className="text-[11.5px] font-medium text-slate-600 dark:text-slate-300">Schedule</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 border border-slate-200 dark:border-slate-700 rounded-xl py-3 hover:bg-slate-50 dark:hover:bg-slate-800">
              <FileCheck2 size={16} className="text-indigo-600" />
              <span className="text-[11.5px] font-medium text-slate-600 dark:text-slate-300">Documents</span>
            </button>
          </div>

          {/* Notes */}
          <div>
            <div className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mb-2.5 uppercase tracking-wide">Notes</div>
            <div className="space-y-3">
              {inquiry.notes.map((n, idx) => (
                <div key={idx} className="border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                  <div className="text-[12px] text-slate-400 dark:text-slate-500 mb-0.5">{n.date}</div>
                  <div className="text-[13px] text-slate-700 dark:text-slate-200">{n.text}</div>
                </div>
              ))}
            </div>
            <textarea
              placeholder="Add a note..."
              rows={2}
              className="w-full mt-3 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-indigo-300 resize-none dark:text-slate-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   NEW INQUIRY MODAL
--------------------------------------------------------- */

function NewInquiryModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    student: "", parentName: "", phone: "", email: "", classApplied: CLASSES_APPLIED[0], source: "Website",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[15px]">New Inquiry</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Student name</label>
            <input value={form.student} onChange={set("student")} placeholder="e.g. Aarav Gupta" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Parent / guardian name</label>
            <input value={form.parentName} onChange={set("parentName")} placeholder="e.g. Gupta Family" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Phone</label>
              <input value={form.phone} onChange={set("phone")} placeholder="+91 90000 00000" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Class applied</label>
              <select value={form.classApplied} onChange={set("classApplied")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 bg-white dark:bg-slate-900 dark:text-slate-100">
                {CLASSES_APPLIED.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Email</label>
            <input value={form.email} onChange={set("email")} placeholder="parent@example.com" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Source</label>
            <select value={form.source} onChange={set("source")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 bg-white dark:bg-slate-900 dark:text-slate-100">
              {["Website", "Walk-in", "Referral", "Phone Call", "Social Media"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 text-[13.5px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!form.student.trim()) return;
              onCreate(form);
            }}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium"
          >
            Create Inquiry
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   COORDINATOR DASHBOARD
--------------------------------------------------------- */

function CoordinatorDashboard({ students, onOpenStudent, onShowIdCard, school }) {
  const recentlyEnrolled = students.filter((s) => s.status === "Recently Enrolled");
  const allocated = students.filter((s) => s.status !== "Recently Enrolled");
  const total = students.length;

  const byClass = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      map[s.classApplied] = (map[s.classApplied] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [students]);
  const maxClassCount = Math.max(...byClass.map((c) => c[1]), 1);

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Coordinator Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Newly confirmed admissions waiting for section allocation at {school.name}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total enrolled" value={total} icon={Users} tint="#4F46E5" />
        <KpiCard label="Awaiting allocation" value={recentlyEnrolled.length} icon={ClipboardCheck} tint="#D97706" />
        <KpiCard label="Fully allocated" value={allocated.length} icon={UserCheck} tint="#059669" />
        <KpiCard label="Sections in use" value={new Set(allocated.map((s) => `${s.classApplied}-${s.section}`)).size} icon={Layers} tint="#0EA5A0" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px]">Recently enrolled &mdash; awaiting allocation</h3>
            <span className="text-[12px] text-slate-400 dark:text-slate-500">{recentlyEnrolled.length} students</span>
          </div>
          {recentlyEnrolled.length === 0 && (
            <p className="text-slate-400 dark:text-slate-500 text-[13px] py-6 text-center">No students waiting on allocation right now.</p>
          )}
          <div className="space-y-1">
            {recentlyEnrolled.map((s) => (
              <div key={s.id} className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <button onClick={() => onOpenStudent(s)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  <Avatar name={s.name} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{s.name}</div>
                    <div className="text-[12px] text-slate-400 dark:text-slate-500">{s.classApplied} &middot; {s.parentName}</div>
                  </div>
                  <StudentStatusPill status={s.status} compact />
                </button>
                {onShowIdCard && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onShowIdCard(s); }}
                    className="ml-1 inline-flex items-center gap-1 text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600"
                    title="View ID card"
                  >
                    <IdCard size={13} /> ID card
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Enrollment by class</h3>
          <div className="space-y-2.5">
            {byClass.map(([cls, count]) => (
              <div key={cls} className="flex items-center gap-3">
                <div className="w-16 text-[12px] text-slate-500 dark:text-slate-400 shrink-0 truncate">{cls}</div>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${(count / maxClassCount) * 100}%` }} />
                </div>
                <div className="w-5 text-right text-[12px] font-medium text-slate-700 dark:text-slate-200">{count}</div>
              </div>
            ))}
            {byClass.length === 0 && <p className="text-slate-400 dark:text-slate-500 text-[13px]">No enrolled students yet.</p>}
          </div>
        </div>
      </div>

      {allocated.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mt-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Allocated students</h3>
          <div className="space-y-1">
            {allocated.map((s) => (
              <div key={s.id} className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <button onClick={() => onOpenStudent(s)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  <Avatar name={s.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{s.name}</div>
                    <div className="text-[12px] text-slate-400 dark:text-slate-500">
                      {s.classApplied} - {s.section} &middot; Roll {s.rollNumber} &middot; {s.house?.split(" (")[0]}
                    </div>
                  </div>
                  <StudentStatusPill status={s.status} compact />
                </button>
                {onShowIdCard && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onShowIdCard(s); }}
                    className="ml-1 inline-flex items-center gap-1 text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600"
                    title="View ID card"
                  >
                    <IdCard size={13} /> ID card
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   ALLOCATION DRAWER
--------------------------------------------------------- */

function AllocationDrawer({ student, onClose, onSave, sectionCounts, onViewTimeline, onShowIdCard }) {
  const [form, setForm] = useState({
    academicYear: student.academicYear || ACADEMIC_YEARS[0],
    section: student.section || "",
    rollNumber: student.rollNumber || "",
    house: student.house || "",
    busRoute: student.busRoute || "",
    hostel: student.hostel || "Not Applicable",
    classTeacher: student.classTeacher || "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const teacherOptions = CLASS_TEACHERS[student.classApplied] || ["Class Teacher TBD"];
  const complete = form.section && form.rollNumber && form.house && form.busRoute && form.classTeacher;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <span className="text-[12.5px] text-slate-400 dark:text-slate-500 font-medium">{student.id}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <Avatar name={student.name} size={44} />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-[16px]">{student.name}</div>
              <div className="text-slate-500 dark:text-slate-400 text-[13px]">Applied for {student.classApplied}</div>
            </div>
          </div>
          <div className="mb-5 flex items-center gap-2 flex-wrap">
            <StudentStatusPill status={student.status} />
            {onShowIdCard && (
              <button onClick={() => onShowIdCard(student)} className="flex items-center gap-1 text-indigo-600 text-[12px] font-medium border border-indigo-200 dark:border-indigo-800 rounded-md px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-950">
                <IdCard size={12} /> View ID card
              </button>
            )}
            <button onClick={() => onViewTimeline(student)} className="flex items-center gap-1 text-indigo-600 text-[12px] font-medium ml-auto">
              <History size={12} /> View timeline
            </button>
          </div>

          <div className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mb-2.5 uppercase tracking-wide">Allocation</div>
          <div className="space-y-3 mb-6">
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Academic year</label>
              <select value={form.academicYear} onChange={set("academicYear")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 bg-white dark:bg-slate-900 dark:text-slate-100">
                {ACADEMIC_YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Class</label>
                <input disabled value={student.classApplied} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Section</label>
                <select value={form.section} onChange={set("section")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 bg-white dark:bg-slate-900 dark:text-slate-100">
                  <option value="">Select</option>
                  {SECTIONS.map((sec) => {
                    const count = sectionCounts[`${student.classApplied}-${sec}`] || 0;
                    return <option key={sec} value={sec} disabled={count >= SECTION_CAPACITY}>{`Section ${sec} (${count}/${SECTION_CAPACITY})`}</option>;
                  })}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Roll number</label>
              <input value={form.rollNumber} onChange={set("rollNumber")} placeholder="e.g. 24" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">House</label>
              <select value={form.house} onChange={set("house")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 bg-white dark:bg-slate-900 dark:text-slate-100">
                <option value="">Select</option>
                {HOUSES.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Class teacher</label>
              <select value={form.classTeacher} onChange={set("classTeacher")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 bg-white dark:bg-slate-900 dark:text-slate-100">
                <option value="">Select</option>
                {teacherOptions.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Bus route</label>
              <select value={form.busRoute} onChange={set("busRoute")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 bg-white dark:bg-slate-900 dark:text-slate-100">
                <option value="">Select</option>
                {BUS_ROUTES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Hostel</label>
              <select value={form.hostel} onChange={set("hostel")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 bg-white dark:bg-slate-900 dark:text-slate-100">
                {HOSTEL_OPTIONS.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <button
            disabled={!complete}
            onClick={() => onSave(student.id, form)}
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13.5px] font-medium ${
              complete ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            }`}
          >
            Save allocation <CheckCircle2 size={15} />
          </button>
          {!complete && <p className="text-center text-slate-400 dark:text-slate-500 text-[12px] mt-2">Fill in all fields to complete allocation</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SECTION CAPACITY OVERVIEW
--------------------------------------------------------- */

function SectionCapacityScreen({ students }) {
  const combos = useMemo(() => {
    const classes = Object.keys(CLASS_TEACHERS);
    const rows = [];
    classes.forEach((cls) => {
      SECTIONS.forEach((sec) => {
        const count = students.filter((s) => s.classApplied === cls && s.section === sec).length;
        if (count > 0 || SECTIONS.indexOf(sec) === 0) rows.push({ cls, sec, count });
      });
    });
    return rows;
  }, [students]);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Section Capacity Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Live headcount against the {SECTION_CAPACITY}-seat section capacity</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[12px] text-slate-400 dark:text-slate-500">
              <th className="font-medium px-4 py-3">Class</th>
              <th className="font-medium px-4 py-3">Section</th>
              <th className="font-medium px-4 py-3">Occupancy</th>
              <th className="font-medium px-4 py-3">Seats left</th>
            </tr>
          </thead>
          <tbody>
            {combos.map((r) => {
              const pct = Math.min((r.count / SECTION_CAPACITY) * 100, 100);
              const near = r.count / SECTION_CAPACITY > 0.8;
              return (
                <tr key={`${r.cls}-${r.sec}`} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 text-[13.5px] text-slate-700 dark:text-slate-200">{r.cls}</td>
                  <td className="px-4 py-3 text-[13.5px] text-slate-600 dark:text-slate-300">Section {r.sec}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 w-40">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${near ? "bg-amber-500" : "bg-teal-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[12px] text-slate-500 dark:text-slate-400 w-12 shrink-0">{r.count}/{SECTION_CAPACITY}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-500 dark:text-slate-400">{SECTION_CAPACITY - r.count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   TEACHER DASHBOARD
--------------------------------------------------------- */

function TeacherDashboard({ homeworkList, leaveRequests, attendanceRecords, todayKey, onNavigate, onOpenSection }) {
  const pendingLeaves = leaveRequests.filter((l) => l.status === "pending");
  const upcomingHomework = [...homeworkList].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo).slice(0, 4);

  const attendanceStatus = TEACHER_SECTIONS.map((sec) => {
    const key = `${sec}|${todayKey}`;
    const marked = attendanceRecords[key];
    return { section: sec, marked: !!marked, count: marked ? Object.keys(marked).length : 0 };
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Good morning, {TEACHER_NAME}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">You have {TEACHER_TIMETABLE.length} periods today across {TEACHER_SECTIONS.length} sections</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Sections assigned" value={TEACHER_SECTIONS.length} icon={Layers} tint="#4F46E5" />
        <KpiCard label="Attendance pending" value={attendanceStatus.filter((a) => !a.marked).length} icon={ClipboardCheck} tint="#D97706" />
        <KpiCard label="Homework posted" value={homeworkList.length} icon={BookOpen} tint="#0EA5A0" />
        <KpiCard label="Leave requests" value={pendingLeaves.length} sub={pendingLeaves.length ? "Needs review" : undefined} icon={AlertCircle} tint="#DC2626" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Today's timetable</h3>
          <div className="space-y-2">
            {TEACHER_TIMETABLE.map((t, idx) => (
              <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[12px] font-semibold shrink-0">
                  {t.period}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{t.subject}</div>
                  <div className="text-[12px] text-slate-400 dark:text-slate-500">{t.section}</div>
                </div>
                <span className="text-[12px] text-slate-400 dark:text-slate-500 shrink-0">{t.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Attendance status</h3>
          <div className="space-y-2">
            {attendanceStatus.map((a) => (
              <button
                key={a.section}
                onClick={() => onOpenSection(a.section)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
              >
                <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{a.section}</span>
                {a.marked ? (
                  <span className="flex items-center gap-1 text-[11.5px] font-medium text-emerald-600"><Check size={13} /> Marked</span>
                ) : (
                  <span className="text-[11.5px] font-medium text-amber-600">Pending</span>
                )}
              </button>
            ))}
          </div>
          <button onClick={() => onNavigate("attendance")} className="w-full text-center text-indigo-600 text-[13px] font-medium mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            Go to attendance
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px]">Recent homework</h3>
            <button onClick={() => onNavigate("homework")} className="text-indigo-600 text-[13px] font-medium">View all</button>
          </div>
          <div className="space-y-3">
            {upcomingHomework.map((h) => (
              <div key={h.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <BookOpen size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{h.title}</div>
                  <div className="text-[12px] text-slate-400 dark:text-slate-500">{h.section} &middot; {h.subject} &middot; Due {h.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px]">Leave requests</h3>
            <button onClick={() => onNavigate("leave")} className="text-indigo-600 text-[13px] font-medium">View all</button>
          </div>
          <div className="space-y-3">
            {pendingLeaves.length === 0 && <p className="text-slate-400 dark:text-slate-500 text-[13px]">No pending requests.</p>}
            {pendingLeaves.map((l) => (
              <div key={l.id} className="flex items-center gap-3">
                <Avatar name={l.studentName} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{l.studentName}</div>
                  <div className="text-[12px] text-slate-400 dark:text-slate-500">{l.fromDate} - {l.toDate} &middot; {l.section}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ATTENDANCE SCREEN
--------------------------------------------------------- */

function AttendanceScreen({ initialSection, attendanceRecords, todayKey, onSave }) {
  const [section, setSection] = useState(initialSection || TEACHER_SECTIONS[0]);
  const roster = useMemo(() => makeRoster(section), [section]);
  const savedKey = `${section}|${todayKey}`;
  const saved = attendanceRecords[savedKey];

  const [marks, setMarks] = useState(() => {
    const init = {};
    roster.forEach((s) => { init[s.id] = saved?.[s.id] || "present"; });
    return init;
  });

  React.useEffect(() => {
    const init = {};
    const r = makeRoster(section);
    const sv = attendanceRecords[`${section}|${todayKey}`];
    r.forEach((s) => { init[s.id] = sv?.[s.id] || "present"; });
    setMarks(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const presentCount = Object.values(marks).filter((v) => v === "present").length;
  const absentCount = Object.values(marks).filter((v) => v === "absent").length;
  const lateCount = Object.values(marks).filter((v) => v === "late").length;

  const STATUS_STYLE = {
    present: { bg: "bg-emerald-600", text: "text-white" },
    absent: { bg: "bg-rose-500", text: "text-white" },
    late: { bg: "bg-amber-500", text: "text-white" },
  };

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Mark Attendance</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Today, {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TEACHER_SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium ${section === s ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-center">
          <div className="text-lg font-semibold text-emerald-600">{presentCount}</div>
          <div className="text-[11.5px] text-slate-400 dark:text-slate-500">Present</div>
        </div>
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-center">
          <div className="text-lg font-semibold text-rose-500">{absentCount}</div>
          <div className="text-[11.5px] text-slate-400 dark:text-slate-500">Absent</div>
        </div>
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-center">
          <div className="text-lg font-semibold text-amber-500">{lateCount}</div>
          <div className="text-[11.5px] text-slate-400 dark:text-slate-500">Late</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-50">
        {roster.map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-6 text-[12px] text-slate-400 dark:text-slate-500 shrink-0">{s.rollNumber}</span>
            <Avatar name={s.name} size={30} />
            <span className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100 flex-1 min-w-0 truncate">{s.name}</span>
            <div className="flex gap-1.5 shrink-0">
              {["present", "late", "absent"].map((st) => (
                <button
                  key={st}
                  onClick={() => setMarks((m) => ({ ...m, [s.id]: st }))}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize ${
                    marks[s.id] === st ? `${STATUS_STYLE[st].bg} ${STATUS_STYLE[st].text}` : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSave(section, todayKey, marks)}
        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium flex items-center justify-center gap-2"
      >
        <CheckCircle2 size={15} /> Save attendance for {section}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
   HOMEWORK SCREEN
--------------------------------------------------------- */

function HomeworkScreen({ homeworkList, onPost }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ section: TEACHER_SECTIONS[0], subject: HOMEWORK_SUBJECTS[0], title: "", due: "Tomorrow", attachment: null });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleAttachment(file) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Please attach a file under 8MB.");
      return;
    }
    readFileAsDataUrl(file, (dataUrl) => {
      setForm((f) => ({ ...f, attachment: { name: file.name, dataUrl, type: file.type } }));
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Homework</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">{homeworkList.length} items posted across your sections</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-2 text-[13.5px] font-medium"
        >
          <Plus size={15} /> Post homework
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-5">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Section</label>
              <select value={form.section} onChange={set("section")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] bg-white dark:bg-slate-900 outline-none focus:border-indigo-300 dark:text-slate-100">
                {TEACHER_SECTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Subject</label>
              <select value={form.subject} onChange={set("subject")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] bg-white dark:bg-slate-900 outline-none focus:border-indigo-300 dark:text-slate-100">
                {HOMEWORK_SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Title / instructions</label>
            <textarea value={form.title} onChange={set("title")} rows={2} placeholder="e.g. Complete worksheet 5, questions 1-12" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 resize-none dark:text-slate-100" />
          </div>
          <div className="mb-3">
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Attachment (optional)</label>
            {form.attachment ? (
              <div className="flex items-center gap-2.5 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  {form.attachment.type === "application/pdf" ? <FileText size={15} /> : <ImageIcon size={15} />}
                </div>
                <span className="text-[12.5px] text-slate-600 dark:text-slate-300 truncate flex-1 min-w-0">{form.attachment.name}</span>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, attachment: null }))}
                  className="text-slate-400 hover:text-rose-500 shrink-0"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg py-3 text-[12.5px] text-slate-500 dark:text-slate-400 cursor-pointer hover:border-indigo-300">
                <Paperclip size={14} /> Attach a photo or PDF
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleAttachment(e.target.files[0])}
                />
              </label>
            )}
          </div>
          <div className="mb-4">
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Due</label>
            <select value={form.due} onChange={set("due")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] bg-white dark:bg-slate-900 outline-none focus:border-indigo-300 dark:text-slate-100">
              {["Tomorrow", "In 2 days", "In 3 days", "Next Monday"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 text-[13.5px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            <button
              onClick={() => { if (!form.title.trim()) return; onPost(form); setForm({ ...form, title: "", attachment: null }); setShowForm(false); }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium flex items-center justify-center gap-2"
            >
              <Send size={14} /> Post to {form.section}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {homeworkList.map((h) => (
          <div key={h.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <BookOpen size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{h.title}</div>
              <div className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">{h.section} &middot; {h.subject} &middot; Due {h.due}</div>
              {h.attachment && (
                <a
                  href={h.attachment.dataUrl}
                  download={h.attachment.name}
                  className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {h.attachment.type === "application/pdf" ? <FileText size={13} /> : <ImageIcon size={13} />}
                  {h.attachment.name}
                </a>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">{h.postedDaysAgo === 0 ? "Today" : `${h.postedDaysAgo}d ago`}</span>
              <a
                href={buildWhatsAppLink("", `New homework for ${h.section} (${h.subject}): ${h.title}. Due ${h.due}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
              >
                <MessageCircle size={11} /> Notify
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   GRADEBOOK (TEACHER VIEW)
--------------------------------------------------------- */

function TeacherGradebookScreen({ examMarks, onSaveMarks }) {
  const [section, setSection] = useState(TEACHER_SECTIONS[0]);
  const [subject, setSubject] = useState(HOMEWORK_SUBJECTS[0]);
  const [term, setTerm] = useState(EXAM_TERMS[2]);
  const roster = useMemo(() => makeRoster(section), [section]);
  const key = `${section}|${subject}|${term}`;
  const saved = examMarks[key] || {};

  const [marks, setMarks] = useState(() => {
    const init = {};
    roster.forEach((s) => { init[s.id] = saved[s.id] != null ? String(saved[s.id]) : ""; });
    return init;
  });

  React.useEffect(() => {
    const r = makeRoster(section);
    const sv = examMarks[`${section}|${subject}|${term}`] || {};
    const init = {};
    r.forEach((s) => { init[s.id] = sv[s.id] != null ? String(sv[s.id]) : ""; });
    setMarks(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, subject, term]);

  const entered = Object.values(marks).filter((v) => v !== "").length;
  const classAvg = entered ? Math.round(Object.values(marks).filter((v) => v !== "").reduce((s, v) => s + Number(v), 0) / entered) : 0;

  return (
    <div className="max-w-4xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Gradebook</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Enter exam marks for your assigned sections</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={section} onChange={(e) => setSection(e.target.value)} className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-900 outline-none focus:border-indigo-300 dark:text-slate-100">
          {TEACHER_SECTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-900 outline-none focus:border-indigo-300 dark:text-slate-100">
          {HOMEWORK_SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={term} onChange={(e) => setTerm(e.target.value)} className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-900 outline-none focus:border-indigo-300 dark:text-slate-100">
          {EXAM_TERMS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-center">
          <div className="text-lg font-semibold text-slate-900 dark:text-white">{entered} / {roster.length}</div>
          <div className="text-[11.5px] text-slate-400 dark:text-slate-500">Marks entered</div>
        </div>
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-center">
          <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{entered ? `${classAvg} / ${EXAM_MAX_MARKS}` : "-"}</div>
          <div className="text-[11.5px] text-slate-400 dark:text-slate-500">Class average</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-50 dark:divide-slate-800">
        {roster.map((s) => {
          const val = marks[s.id];
          const num = val === "" ? null : Number(val);
          return (
            <div key={s.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-6 text-[12px] text-slate-400 dark:text-slate-500 shrink-0">{s.rollNumber}</span>
              <Avatar name={s.name} size={30} />
              <span className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100 flex-1 min-w-0 truncate">{s.name}</span>
              <input
                type="number"
                min={0}
                max={EXAM_MAX_MARKS}
                value={val}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v !== "" && (Number(v) < 0 || Number(v) > EXAM_MAX_MARKS)) return;
                  setMarks((m) => ({ ...m, [s.id]: v }));
                }}
                placeholder={`/ ${EXAM_MAX_MARKS}`}
                className="w-20 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-[13px] text-center outline-none focus:border-indigo-300 dark:bg-slate-800 dark:text-slate-100 shrink-0"
              />
              {num != null && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0 w-10 text-center">{computeGrade(num, EXAM_MAX_MARKS)}</span>
              )}
              {num == null && <span className="w-10 shrink-0" />}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          const toSave = {};
          Object.entries(marks).forEach(([id, v]) => { if (v !== "") toSave[id] = Number(v); });
          onSaveMarks(key, toSave);
        }}
        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium flex items-center justify-center gap-2"
      >
        <CheckCircle2 size={15} /> Save marks for {subject}, {section} ({term})
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
   STUDENT LIST + PROFILE (TEACHER VIEW)
--------------------------------------------------------- */

function TeacherStudentList({ onOpenStudent }) {
  const [section, setSection] = useState(TEACHER_SECTIONS[0]);
  const roster = useMemo(() => makeRoster(section), [section]);

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">My Students</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Students in your assigned sections</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TEACHER_SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium ${section === s ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[12px] text-slate-400 dark:text-slate-500">
              <th className="font-medium px-4 py-3">Roll</th>
              <th className="font-medium px-4 py-3">Student</th>
              <th className="font-medium px-4 py-3">House</th>
              <th className="font-medium px-4 py-3">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((s) => (
              <tr key={s.id} onClick={() => onOpenStudent(s)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                <td className="px-4 py-3 text-[13px] text-slate-500 dark:text-slate-400">{s.rollNumber}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={s.name} size={28} />
                    <span className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-500 dark:text-slate-400">{s.house.split(" (")[0]}</td>
                <td className="px-4 py-3">
                  <span className={`text-[12.5px] font-medium ${s.attendancePct >= 90 ? "text-emerald-600" : s.attendancePct >= 80 ? "text-amber-600" : "text-rose-500"}`}>
                    {s.attendancePct}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>
    </div>
  );
}

function TeacherStudentDrawer({ student, notes, onClose, onAddNote, onViewTimeline, onShowIdCard }) {
  const [note, setNote] = useState("");
  const [tone, setTone] = useState("positive");
  if (!student) return null;
  const myNotes = notes[student.id] || [];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
          <span className="text-[12.5px] text-slate-400 dark:text-slate-500 font-medium">Roll {student.rollNumber}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <Avatar name={student.name} size={44} />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-[16px]">{student.name}</div>
              <div className="text-slate-500 dark:text-slate-400 text-[13px]">{student.section} &middot; {student.house.split(" (")[0]}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {onShowIdCard && (
              <button onClick={() => onShowIdCard(student)} className="flex items-center gap-1 text-indigo-600 text-[12px] font-medium border border-indigo-200 dark:border-indigo-800 rounded-md px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-950">
                <IdCard size={12} /> View ID card
              </button>
            )}
            <button onClick={() => onViewTimeline(student)} className="flex items-center gap-1 text-indigo-600 text-[12px] font-medium">
              <History size={12} /> View full timeline
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 text-center">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{student.attendancePct}%</div>
              <div className="text-[11.5px] text-slate-400 dark:text-slate-500">Attendance</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 text-center">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{myNotes.length}</div>
              <div className="text-[11.5px] text-slate-400 dark:text-slate-500">Behaviour notes</div>
            </div>
          </div>

          <div className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mb-2.5 uppercase tracking-wide">Add behaviour note</div>
          <div className="flex gap-2 mb-2.5">
            <button onClick={() => setTone("positive")} className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-medium ${tone === "positive" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"}`}>
              <Award size={13} /> Positive
            </button>
            <button onClick={() => setTone("concern")} className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-medium ${tone === "concern" ? "bg-amber-50 text-amber-700 border border-amber-200" : "border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"}`}>
              <AlertCircle size={13} /> Concern
            </button>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="e.g. Helped a classmate with the science project today"
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-indigo-300 resize-none mb-2 dark:text-slate-100"
          />
          <button
            onClick={() => { if (!note.trim()) return; onAddNote(student.id, { text: note, tone, date: "Today" }); setNote(""); }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-[13px] font-medium mb-6"
          >
            Add note
          </button>

          <div className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mb-2.5 uppercase tracking-wide">History</div>
          <div className="space-y-3">
            {myNotes.length === 0 && <p className="text-slate-400 dark:text-slate-500 text-[13px]">No notes yet.</p>}
            {myNotes.map((n, idx) => (
              <div key={idx} className={`border-l-2 pl-3 ${n.tone === "positive" ? "border-emerald-300" : "border-amber-300"}`}>
                <div className="text-[12px] text-slate-400 dark:text-slate-500 mb-0.5">{n.date}</div>
                <div className="text-[13px] text-slate-700 dark:text-slate-200">{n.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   LEAVE REQUESTS SCREEN
--------------------------------------------------------- */

function LeaveRequestsScreen({ leaveRequests, onRespond }) {
  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Leave Requests</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Requests submitted by parents for your sections</p>
      </div>

      <div className="space-y-2.5">
        {leaveRequests.map((l) => (
          <div key={l.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <Avatar name={l.studentName} size={36} />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{l.studentName}</div>
              <div className="text-[12px] text-slate-400 dark:text-slate-500">{l.section} &middot; {l.fromDate} - {l.toDate}</div>
              <div className="text-[12.5px] text-slate-600 dark:text-slate-300 mt-1">{l.reason}</div>
            </div>
            {l.status === "pending" ? (
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => onRespond(l.id, "approved")} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100">
                  <Check size={15} />
                </button>
                <button onClick={() => onRespond(l.id, "declined")} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100">
                  <XCircle size={15} />
                </button>
              </div>
            ) : (
              <span className={`text-[11.5px] font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${l.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                {l.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   MESSAGES (TEACHER VIEW)
--------------------------------------------------------- */

const TEACHER_STATIC_CONVERSATIONS = {
  "sharma": [
    { from: "parent", text: "Hi, could you let us know how Ishita is doing in Mathematics this term?" },
    { from: "teacher", text: "She's doing well overall — strong on arithmetic, could use a bit more practice on word problems. I'll share some worksheets." },
  ],
  "khan": [
    { from: "parent", text: "Zara mentioned a class trip next month, could you share the details?" },
    { from: "teacher", text: "Yes, I'll send the permission form and itinerary by this Friday." },
  ],
};

const TEACHER_CONVERSATIONS_META = [
  { id: "gupta", parentName: "Gupta Family", studentName: CHILD.name, live: true },
  { id: "sharma", parentName: "Sharma Family", studentName: "Ishita Sharma", live: false },
  { id: "khan", parentName: "Khan Family", studentName: "Zara Khan", live: false },
];

function TeacherMessagesScreen({ liveMessages, onSendLive }) {
  const [activeId, setActiveId] = useState("gupta");
  const [localThreads, setLocalThreads] = useState(TEACHER_STATIC_CONVERSATIONS);
  const [text, setText] = useState("");

  const active = TEACHER_CONVERSATIONS_META.find((c) => c.id === activeId);
  const thread = active.live ? liveMessages : (localThreads[active.id] || []);

  function handleSend() {
    if (!text.trim()) return;
    if (active.live) {
      onSendLive(text);
    } else {
      setLocalThreads((prev) => ({ ...prev, [active.id]: [...(prev[active.id] || []), { from: "teacher", text }] }));
    }
    setText("");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Messages</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Conversations with parents of your students</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden sm:col-span-1">
          {TEACHER_CONVERSATIONS_META.map((c) => {
            const t = c.live ? liveMessages : (localThreads[c.id] || []);
            const last = t[t.length - 1];
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-left border-b border-slate-50 dark:border-slate-800 last:border-0 ${
                  activeId === c.id ? "bg-indigo-50 dark:bg-indigo-500/15" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Avatar name={c.parentName} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100 truncate">{c.parentName}</div>
                  <div className="text-[11.5px] text-slate-400 dark:text-slate-500 truncate">{last ? last.text : `Re: ${c.studentName}`}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="sm:col-span-2 flex flex-col">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex-1 min-h-80 max-h-96 overflow-y-auto flex flex-col gap-3 mb-3">
            <div className="text-[12px] text-slate-400 dark:text-slate-500 text-center pb-1">
              {active.parentName} &middot; {active.studentName}
            </div>
            {thread.length === 0 && <p className="text-slate-400 dark:text-slate-500 text-[13px] text-center my-auto">No messages yet.</p>}
            {thread.map((m, idx) => (
              <div key={idx} className={`max-w-[75%] px-3.5 py-2 rounded-xl text-[13px] ${m.from === "teacher" ? "self-end bg-indigo-600 text-white" : "self-start bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Message ${active.parentName}...`}
              className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 dark:bg-slate-900 dark:text-slate-100"
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            />
            <button
              onClick={handleSend}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 flex items-center justify-center"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   MINI LINE CHART (SVG, no external chart lib)
--------------------------------------------------------- */

function MiniLineChart({ data, height = 120 }) {
  const width = 100; // percentage-based viewBox
  const max = 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.pct / max) * height;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <polyline points={points.join(" ")} fill="none" stroke="#4F46E5" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (d.pct / max) * height;
        return <circle key={i} cx={x} cy={y} r="1.6" fill="#4F46E5" />;
      })}
    </svg>
  );
}

/* ---------------------------------------------------------
   STUDENT DASHBOARD
--------------------------------------------------------- */

function StudentDashboard({ homeworkList, onNavigate, feeInstallments, onShowIdCard }) {
  const myHomework = homeworkList.filter((h) => h.section === CHILD.section);
  const pendingAssignments = ASSIGNMENTS.filter((a) => a.status === "Pending");
  const feeDue = feeInstallments.filter((f) => f.status === "due").reduce((s, f) => s + f.amount, 0);

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Hi {CHILD.name.split(" ")[0]}! Ready for today?</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">{CHILD.section} &middot; Roll No. {CHILD.rollNumber}</p>
        </div>
        {onShowIdCard && (
          <button
            onClick={onShowIdCard}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg px-3 py-1.5"
          >
            <IdCard size={13} /> View ID card
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Attendance" value={`${CHILD.attendancePct}%`} icon={UserCheck} tint="#059669" />
        <KpiCard label="Homework due" value={myHomework.length + pendingAssignments.length} icon={BookOpen} tint="#D97706" />
        <KpiCard label="Fee due" value={feeDue ? `Rs ${feeDue.toLocaleString("en-IN")}` : "None"} icon={IndianRupee} tint={feeDue ? "#DC2626" : "#059669"} />
        <KpiCard label="Next event" value={SCHOOL_EVENTS[0].date.split(" ")[0] + " " + SCHOOL_EVENTS[0].date.split(" ")[1]} sub={SCHOOL_EVENTS[0].title} icon={CalendarDays} tint="#4F46E5" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Today's timetable</h3>
          <div className="space-y-2">
            {STUDENT_TIMETABLE.map((t, idx) => (
              <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[12px] font-semibold shrink-0">{t.period}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{t.subject}</div>
                  <div className="text-[12px] text-slate-400 dark:text-slate-500">{t.teacher}</div>
                </div>
                <span className="text-[12px] text-slate-400 dark:text-slate-500 shrink-0">{t.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px]">Performance trend</h3>
            <button onClick={() => onNavigate("results")} className="text-indigo-600 text-[12.5px] font-medium">Details</button>
          </div>
          <MiniLineChart data={PERFORMANCE_HISTORY} />
          <div className="flex justify-between mt-1">
            {PERFORMANCE_HISTORY.map((d, i) => <span key={i} className="text-[10.5px] text-slate-400 dark:text-slate-500">{d.term.split(" ")[0]} {d.term.split(" ")[1]}</span>)}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px]">Homework & assignments</h3>
            <button onClick={() => onNavigate("homework")} className="text-indigo-600 text-[12.5px] font-medium">View all</button>
          </div>
          <div className="space-y-3">
            {[...myHomework.slice(0, 2), ...pendingAssignments.slice(0, 1)].map((h, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"><BookOpen size={13} /></div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100 line-clamp-2">{h.title}</div>
                  <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{h.subject} &middot; Due {h.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px]">Achievements</h3>
            <button onClick={() => onNavigate("campus")} className="text-indigo-600 text-[12.5px] font-medium">View all</button>
          </div>
          <div className="space-y-3">
            {ACHIEVEMENTS.slice(0, 2).map((a, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Trophy size={13} /></div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100 line-clamp-2">{a.title}</div>
                  <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-3">Upcoming events</h3>
          <div className="space-y-3">
            {SCHOOL_EVENTS.map((e, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><CalendarDays size={13} /></div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{e.title}</div>
                  <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{e.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   HOMEWORK & ASSIGNMENTS (STUDENT VIEW)
--------------------------------------------------------- */

function StudentHomeworkScreen({ homeworkList }) {
  const myHomework = homeworkList.filter((h) => h.section === CHILD.section);
  const STATUS_TINT = { Pending: "#D97706", Submitted: "#0EA5A0", Graded: "#059669" };

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Homework & Assignments</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">{CHILD.section}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5">Homework</h3>
        <div className="space-y-2.5">
          {myHomework.length === 0 && <p className="text-slate-400 dark:text-slate-500 text-[13px]">No homework posted right now.</p>}
          {myHomework.map((h) => (
            <div key={h.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"><BookOpen size={16} /></div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{h.title}</div>
                <div className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">{h.subject} &middot; Due {h.due}</div>
                {h.attachment && (
                  <a
                    href={h.attachment.dataUrl}
                    download={h.attachment.name}
                    className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {h.attachment.type === "application/pdf" ? <FileText size={13} /> : <ImageIcon size={13} />}
                    {h.attachment.name}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5">Assignments</h3>
        <div className="space-y-2.5">
          {ASSIGNMENTS.map((a) => (
            <div key={a.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><PenSquare size={16} /></div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{a.title}</div>
                <div className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">{a.subject} &middot; Due {a.due}{a.grade ? ` &middot; Grade ${a.grade}` : ""}</div>
              </div>
              <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full shrink-0" style={{ background: STATUS_TINT[a.status] + "1a", color: STATUS_TINT[a.status] }}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   RESULTS SCREEN
--------------------------------------------------------- */

function StudentResultsScreen({ examMarks, child }) {
  const term = EXAM_TERMS[2];
  const subjects = HOMEWORK_SUBJECTS.map((subject) => {
    const key = `${child.section}|${subject}|${term}`;
    const liveMarks = examMarks[key]?.[child.id];
    if (liveMarks != null) {
      return { subject, marks: liveMarks, max: EXAM_MAX_MARKS, grade: computeGrade(liveMarks, EXAM_MAX_MARKS), live: true };
    }
    const seed = EXAM_RESULTS.subjects.find((s) => s.subject === subject);
    return seed ? { ...seed, live: false } : { subject, marks: 0, max: EXAM_MAX_MARKS, grade: "-", live: false };
  });
  const overallPct = Math.round((subjects.reduce((s, x) => s + x.marks, 0) / subjects.reduce((s, x) => s + x.max, 0)) * 100);

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Exam Results</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">{term} Progress Report</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <KpiCard label="Overall score" value={`${overallPct}%`} icon={Trophy} tint="#4F46E5" />
        <KpiCard label="Subjects" value={subjects.length} icon={BookOpen} tint="#0EA5A0" />
        <KpiCard label="Rank in class" value="3rd" sub="of 28 students" icon={Award} tint="#059669" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-5">
        <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Performance across terms</h3>
        <MiniLineChart data={PERFORMANCE_HISTORY} height={140} />
        <div className="flex justify-between mt-1">
          {PERFORMANCE_HISTORY.map((d, i) => <span key={i} className="text-[11px] text-slate-400 dark:text-slate-500">{d.term}</span>)}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[12px] text-slate-400 dark:text-slate-500">
              <th className="font-medium px-4 py-3">Subject</th>
              <th className="font-medium px-4 py-3">Marks</th>
              <th className="font-medium px-4 py-3">Grade</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.subject} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 text-[13.5px] text-slate-700 dark:text-slate-200">{s.subject}</td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{s.marks} / {s.max}</td>
                <td className="px-4 py-3">
                  <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{s.grade}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   FEES SCREEN (shared by student read-only + parent payable)
--------------------------------------------------------- */

function buildWhatsAppLink(phone, message) {
  const digits = (phone || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/* ---------------------------------------------------------
   PAYMENT CHECKOUT (simulated gateway)
--------------------------------------------------------- */

function PaymentCheckoutModal({ installment, onClose, onSuccess }) {
  const [method, setMethod] = useState("upi");
  const [stage, setStage] = useState("form"); // form -> processing -> success
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });

  function handlePay() {
    setStage("processing");
    setTimeout(() => {
      setStage("success");
      setTimeout(() => { onSuccess(); }, 900);
    }, 1400);
  }

  const canPay = method === "upi" ? upiId.trim().includes("@") : method === "card" ? card.number.length >= 12 && card.expiry && card.cvv.length >= 3 : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={stage === "form" ? onClose : undefined} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-white text-[13px] font-semibold">Vedaalay Pay</div>
            <div className="text-indigo-200 text-[11px]">Secure checkout</div>
          </div>
          {stage === "form" && (
            <button onClick={onClose} className="text-indigo-200 hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>

        {stage === "form" && (
          <div className="p-5">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 mb-4">
              <span className="text-[12.5px] text-slate-500 dark:text-slate-400">{installment.name}</span>
              <span className="text-[16px] font-semibold text-slate-900 dark:text-white">Rs {installment.amount.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex gap-1.5 mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {[
                { id: "upi", label: "UPI", icon: Smartphone },
                { id: "card", label: "Card", icon: CreditCard },
                { id: "netbanking", label: "Net Banking", icon: Landmark },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[12px] font-medium ${
                    method === m.id ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <m.icon size={13} /> {m.label}
                </button>
              ))}
            </div>

            {method === "upi" && (
              <div className="mb-4">
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">UPI ID</label>
                <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 dark:bg-slate-800 dark:text-slate-100" />
              </div>
            )}
            {method === "card" && (
              <div className="space-y-2.5 mb-4">
                <input value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="Card number" maxLength={16} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 dark:bg-slate-800 dark:text-slate-100" />
                <div className="flex gap-2.5">
                  <input value={card.expiry} onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))} placeholder="MM/YY" className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 dark:bg-slate-800 dark:text-slate-100" />
                  <input value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="CVV" maxLength={3} className="w-24 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 dark:bg-slate-800 dark:text-slate-100" />
                </div>
              </div>
            )}
            {method === "netbanking" && (
              <div className="mb-4">
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Select bank</label>
                <select className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13.5px] bg-white dark:bg-slate-800 outline-none focus:border-indigo-300 dark:text-slate-100">
                  {["State Bank of India", "HDFC Bank", "ICICI Bank", "Punjab National Bank", "Axis Bank"].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
            )}

            <button
              disabled={!canPay}
              onClick={handlePay}
              className={`w-full rounded-lg py-3 text-[13.5px] font-medium ${canPay ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}
            >
              Pay Rs {installment.amount.toLocaleString("en-IN")}
            </button>
            <p className="text-center text-slate-400 dark:text-slate-500 text-[11px] mt-3">Prototype checkout &middot; no real payment is processed</p>
          </div>
        )}

        {stage === "processing" && (
          <div className="p-10 flex flex-col items-center">
            <Loader2 size={32} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-[13.5px] text-slate-600 dark:text-slate-300">Processing your payment...</p>
          </div>
        )}

        {stage === "success" && (
          <div className="p-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 size={28} />
            </div>
            <p className="text-[14px] font-medium text-slate-800 dark:text-slate-100">Payment successful</p>
            <p className="text-[12.5px] text-slate-400 dark:text-slate-500 mt-1">Rs {installment.amount.toLocaleString("en-IN")} paid</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeesScreen({ installments, onPay, canPay, child }) {
  const [checkoutFor, setCheckoutFor] = useState(null);
  const total = installments.reduce((s, f) => s + f.amount, 0);
  const paid = installments.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const due = total - paid;

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Fee Payment</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">{child.name} &middot; {child.section} &middot; Academic Year 2026-27</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <KpiCard label="Total annual fee" value={`Rs ${total.toLocaleString("en-IN")}`} icon={IndianRupee} tint="#4F46E5" />
        <KpiCard label="Paid" value={`Rs ${paid.toLocaleString("en-IN")}`} icon={CheckCircle2} tint="#059669" />
        <KpiCard label="Due" value={`Rs ${due.toLocaleString("en-IN")}`} icon={AlertCircle} tint={due ? "#DC2626" : "#059669"} />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-50">
        {installments.map((f) => (
          <div key={f.id} className="flex items-center gap-3 px-4 py-3.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${f.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              <Wallet size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{f.name}</div>
              <div className="text-[12px] text-slate-400 dark:text-slate-500">Due {f.dueDate}</div>
            </div>
            <span className="text-[13.5px] font-semibold text-slate-700 dark:text-slate-200 shrink-0">Rs {f.amount.toLocaleString("en-IN")}</span>
            {f.status === "paid" ? (
              <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 shrink-0">Paid</span>
            ) : canPay ? (
              <button
                onClick={() => setCheckoutFor(f)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 text-[12.5px] font-medium shrink-0"
              >
                <CreditCard size={13} /> Pay Now
              </button>
            ) : (
              <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 shrink-0">Due</span>
            )}
          </div>
        ))}
      </div>

      {checkoutFor && (
        <PaymentCheckoutModal
          installment={checkoutFor}
          onClose={() => setCheckoutFor(null)}
          onSuccess={() => { onPay(checkoutFor.id); setCheckoutFor(null); }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   CAMPUS LIFE (achievements, certificates, transport, library)
--------------------------------------------------------- */

function CampusLifeScreen() {
  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Campus Life</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Achievements, certificates, transport, and library</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4 flex items-center gap-2"><Trophy size={16} className="text-amber-500" /> Achievements</h3>
          <div className="space-y-3">
            {ACHIEVEMENTS.map((a, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Trophy size={13} /></div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{a.title}</div>
                  <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4 flex items-center gap-2"><FileText size={16} className="text-indigo-500" /> Certificates</h3>
          <div className="space-y-3">
            {CERTIFICATES.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><FileText size={13} /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{c.title}</div>
                  <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{c.date}</div>
                </div>
                <button className="text-indigo-600 text-[12px] font-medium shrink-0">Download</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4 flex items-center gap-2"><Bus size={16} className="text-teal-500" /> Transport</h3>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Route</span><span className="text-slate-700 dark:text-slate-200 font-medium">{TRANSPORT_INFO.route}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Bus number</span><span className="text-slate-700 dark:text-slate-200 font-medium">{TRANSPORT_INFO.busNumber}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Driver</span><span className="text-slate-700 dark:text-slate-200 font-medium">{TRANSPORT_INFO.driver}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Pickup</span><span className="text-slate-700 dark:text-slate-200 font-medium">{TRANSPORT_INFO.pickupTime}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Drop</span><span className="text-slate-700 dark:text-slate-200 font-medium">{TRANSPORT_INFO.dropTime}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Stop</span><span className="text-slate-700 dark:text-slate-200 font-medium text-right">{TRANSPORT_INFO.stop}</span></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4 flex items-center gap-2"><BookMarked size={16} className="text-rose-500" /> Library</h3>
          <div className="space-y-3">
            {LIBRARY_BOOKS.map((b, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><BookMarked size={13} /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{b.title}</div>
                  <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{b.author} &middot; Due {b.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PARENT DASHBOARD
--------------------------------------------------------- */

function ParentDashboard({ child, children, onSwitchChild, homeworkList, feeInstallments, onNavigate, notices, onShowIdCard }) {
  const myHomework = homeworkList.filter((h) => h.section === child.section);
  const feeDue = feeInstallments.filter((f) => f.status === "due").reduce((s, f) => s + f.amount, 0);

  return (
    <div className="max-w-6xl">
      {children.length > 1 && (
        <div className="flex gap-2 mb-4">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => onSwitchChild(c.id)}
              className={`flex items-center gap-2 rounded-full pl-1.5 pr-3.5 py-1.5 text-[13px] font-medium border ${
                c.id === child.id ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Avatar name={c.name} size={22} />
              {c.name.split(" ")[0]}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 mb-6">
        <Avatar name={child.name} size={46} />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{child.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px]">{child.section} &middot; Roll No. {child.rollNumber} &middot; {child.house.split(" (")[0]}</p>
        </div>
        {onShowIdCard && (
          <button
            onClick={() => onShowIdCard(child)}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg px-3 py-1.5"
          >
            <IdCard size={13} /> View ID card
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Attendance" value={`${child.attendancePct}%`} icon={UserCheck} tint="#059669" />
        <KpiCard label="Homework pending" value={myHomework.length} icon={BookOpen} tint="#D97706" />
        <KpiCard label="Fee due" value={feeDue ? `Rs ${feeDue.toLocaleString("en-IN")}` : "None"} icon={IndianRupee} tint={feeDue ? "#DC2626" : "#059669"} />
        <KpiCard label="Upcoming PTM" value="22 Aug" icon={CalendarPlus} tint="#4F46E5" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">School notices</h3>
          <div className="space-y-3">
            {notices.map((n, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Bell size={13} /></div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{n.title}</div>
                  <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{n.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Quick actions</h3>
          <div className="space-y-2">
            <button onClick={() => onNavigate("fees")} className="w-full flex items-center gap-2.5 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
              <CreditCard size={15} className="text-indigo-600" /><span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">Pay fees</span>
            </button>
            <button onClick={() => onNavigate("messages")} className="w-full flex items-center gap-2.5 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
              <MessageCircle size={15} className="text-indigo-600" /><span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">Message teacher</span>
            </button>
            <button onClick={() => onNavigate("leaveptm")} className="w-full flex items-center gap-2.5 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left">
              <CalendarPlus size={15} className="text-indigo-600" /><span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">Apply leave / book PTM</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Homework this week</h3>
          <div className="space-y-3">
            {myHomework.length === 0 && <p className="text-slate-400 dark:text-slate-500 text-[13px]">No homework posted right now.</p>}
            {myHomework.map((h) => (
              <div key={h.id} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"><BookOpen size={13} /></div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{h.title}</div>
                  <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{h.subject} &middot; Due {h.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Transport</h3>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Route</span><span className="text-slate-700 dark:text-slate-200 font-medium">{TRANSPORT_INFO.route}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Pickup</span><span className="text-slate-700 dark:text-slate-200 font-medium">{TRANSPORT_INFO.pickupTime}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Drop</span><span className="text-slate-700 dark:text-slate-200 font-medium">{TRANSPORT_INFO.dropTime}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PARENT MESSAGES
--------------------------------------------------------- */

function ParentMessagesScreen({ messages, onSend }) {
  const [text, setText] = useState("");
  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Messages</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Conversation with {TEACHER_NAME}, Class Teacher</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-96 overflow-y-auto flex flex-col gap-3 mb-3">
        {messages.map((m, idx) => (
          <div key={idx} className={`max-w-[75%] px-3.5 py-2 rounded-xl text-[13px] ${m.from === "parent" ? "self-end bg-indigo-600 text-white" : "self-start bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100"
          onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { onSend(text); setText(""); } }}
        />
        <button
          onClick={() => { if (!text.trim()) return; onSend(text); setText(""); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 flex items-center justify-center"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PARENT: LEAVE REQUEST + PTM BOOKING
--------------------------------------------------------- */

function ParentLeavePTMScreen({ child, onApplyLeave, onBookPtm, ptmBooked }) {
  const [leaveForm, setLeaveForm] = useState({ fromDate: "", toDate: "", reason: "" });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Leave & PTM</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">For {child.name} &middot; Apply for leave or book a parent-teacher meeting slot</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Apply for leave</h3>
        {submitted ? (
          <div className="flex items-center gap-2.5 text-emerald-700 bg-emerald-50 rounded-lg px-3.5 py-3 text-[13px]">
            <CheckCircle2 size={16} /> Leave request sent to {TEACHER_NAME}. You'll be notified once it's reviewed.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">From date</label>
                <input type="date" value={leaveForm.fromDate} onChange={(e) => setLeaveForm((f) => ({ ...f, fromDate: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">To date</label>
                <input type="date" value={leaveForm.toDate} onChange={(e) => setLeaveForm((f) => ({ ...f, toDate: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Reason</label>
              <textarea value={leaveForm.reason} onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))} rows={2} placeholder="e.g. Family function" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 resize-none dark:text-slate-100" />
            </div>
            <button
              onClick={() => { if (!leaveForm.reason.trim()) return; onApplyLeave(leaveForm); setSubmitted(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2.5 text-[13.5px] font-medium"
            >
              Submit request
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Book a PTM slot</h3>
        {ptmBooked ? (
          <div className="flex items-center gap-2.5 text-emerald-700 bg-emerald-50 rounded-lg px-3.5 py-3 text-[13px]">
            <CheckCircle2 size={16} /> Slot confirmed: {ptmBooked}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {PTM_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => onBookPtm(slot)}
                className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 hover:border-indigo-300 hover:bg-indigo-50/40 text-left"
              >
                <CalendarPlus size={14} className="text-indigo-600" />
                <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{slot}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PRINCIPAL DASHBOARD
--------------------------------------------------------- */

function PrincipalDashboard({ inquiries, students, school, onNavigate }) {
  const totalStudents = CLASS_STRENGTH.reduce((s, c) => s + c.strength, 0);
  const totalCapacity = CLASS_STRENGTH.reduce((s, c) => s + c.capacity, 0);
  const admissionsThisMonth = inquiries.filter((i) => i.stage === "confirmed").length;
  const totalDue = DEFAULTERS.reduce((s, d) => s + d.due, 0);

  const funnelCounts = STAGES.map((s) => ({ ...s, count: inquiries.filter((i) => i.stage === s.id).length }));
  const maxFunnel = Math.max(...funnelCounts.map((f) => f.count), 1);

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">School Health Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">{school.name} &middot; Academic Year 2026-27</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total students" value={totalStudents} sub={`${Math.round((totalStudents / totalCapacity) * 100)}% capacity`} icon={Users} tint="#4F46E5" />
        <KpiCard label="Admissions confirmed" value={admissionsThisMonth} icon={UserCheck} tint="#059669" />
        <KpiCard label="Fee collection" value="91%" sub="this term" icon={IndianRupee} tint="#0EA5A0" />
        <KpiCard label="Fee defaulters" value={DEFAULTERS.length} sub={`Rs ${totalDue.toLocaleString("en-IN")} pending`} icon={AlertTriangle} tint="#DC2626" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Revenue collection trend</h3>
          <MiniLineChart data={REVENUE_TREND} height={130} />
          <div className="flex justify-between mt-1">
            {REVENUE_TREND.map((d, i) => <span key={i} className="text-[11px] text-slate-400 dark:text-slate-500">{d.term}</span>)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">School-wide attendance trend</h3>
          <MiniLineChart data={ATTENDANCE_TREND} height={130} />
          <div className="flex justify-between mt-1">
            {ATTENDANCE_TREND.map((d, i) => <span key={i} className="text-[11px] text-slate-400 dark:text-slate-500">{d.term}</span>)}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px]">Admission funnel snapshot</h3>
          </div>
          <div className="space-y-2.5">
            {funnelCounts.map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <div className="w-32 text-[12.5px] text-slate-500 dark:text-slate-400 shrink-0 truncate">{f.label}</div>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(f.count / maxFunnel) * 100}%`, opacity: 0.4 + 0.6 * (f.count / maxFunnel) }} />
                </div>
                <div className="w-6 text-right text-[12.5px] font-medium text-slate-700 dark:text-slate-200">{f.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px] mb-4">Needs attention</h3>
          <div className="space-y-3">
            <button onClick={() => onNavigate("risk")} className="w-full flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><AlertTriangle size={15} /></div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{RISK_STUDENTS.length} at-risk students</div>
                <div className="text-[11.5px] text-slate-400 dark:text-slate-500">Attendance or fee flags</div>
              </div>
              <ChevronRight size={14} className="text-slate-300" />
            </button>
            <button onClick={() => onNavigate("transfers")} className="w-full flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><ArrowRightLeft size={15} /></div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{TRANSFER_REQUESTS.filter((t) => t.status === "pending").length} pending transfers</div>
                <div className="text-[11.5px] text-slate-400 dark:text-slate-500">Awaiting your review</div>
              </div>
              <ChevronRight size={14} className="text-slate-300" />
            </button>
            <button onClick={() => onNavigate("fees")} className="w-full flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><IndianRupee size={15} /></div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{DEFAULTERS.length} fee defaulters</div>
                <div className="text-[11.5px] text-slate-400 dark:text-slate-500">Rs {totalDue.toLocaleString("en-IN")} outstanding</div>
              </div>
              <ChevronRight size={14} className="text-slate-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   FEE COLLECTION & DEFAULTERS
--------------------------------------------------------- */

function FeeCollectionScreen() {
  const totalDue = DEFAULTERS.reduce((s, d) => s + d.due, 0);
  return (
    <div className="max-w-4xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Fee Collection & Defaulters</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Term 3 collection status across the school</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <KpiCard label="Collection rate" value="91%" icon={IndianRupee} tint="#059669" />
        <KpiCard label="Defaulters" value={DEFAULTERS.length} icon={AlertTriangle} tint="#DC2626" />
        <KpiCard label="Amount outstanding" value={`Rs ${totalDue.toLocaleString("en-IN")}`} icon={Wallet} tint="#D97706" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[12px] text-slate-400 dark:text-slate-500">
              <th className="font-medium px-4 py-3">Student</th>
              <th className="font-medium px-4 py-3">Class</th>
              <th className="font-medium px-4 py-3">Amount due</th>
              <th className="font-medium px-4 py-3">Overdue</th>
              <th className="font-medium px-4 py-3">Contact</th>
              <th className="font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {DEFAULTERS.map((d) => (
              <tr key={d.name} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={d.name} size={28} />
                    <div>
                      <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{d.name}</div>
                      <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{d.parent}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{d.cls}</td>
                <td className="px-4 py-3 text-[13px] font-medium text-slate-800 dark:text-slate-100">Rs {d.due.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-full ${d.daysOverdue > 40 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"}`}>
                    {d.daysOverdue} days
                  </span>
                </td>
                <td className="px-4 py-3 text-[12.5px] text-slate-500 dark:text-slate-400">{d.phone}</td>
                <td className="px-4 py-3">
                  <a
                    href={buildWhatsAppLink(d.phone, `Dear ${d.parent}, this is a reminder that a fee payment of Rs ${d.due.toLocaleString("en-IN")} for ${d.name} (${d.cls}) is overdue by ${d.daysOverdue} days. Please pay at your earliest convenience via the Vedaalay parent app. Thank you.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap"
                  >
                    <MessageCircle size={13} /> Remind
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   STUDENT STRENGTH
--------------------------------------------------------- */

function StudentStrengthScreen() {
  const total = CLASS_STRENGTH.reduce((s, c) => s + c.strength, 0);
  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Student Strength</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">{total} students enrolled across all classes</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="space-y-3.5">
          {CLASS_STRENGTH.map((c) => {
            const pct = (c.strength / c.capacity) * 100;
            const near = pct > 90;
            return (
              <div key={c.cls} className="flex items-center gap-3">
                <div className="w-20 text-[13px] text-slate-600 dark:text-slate-300 shrink-0">{c.cls}</div>
                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${near ? "bg-amber-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="w-20 text-right text-[12.5px] text-slate-500 dark:text-slate-400 shrink-0">{c.strength} / {c.capacity}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   TEACHER PERFORMANCE
--------------------------------------------------------- */

function TeacherPerformanceScreen() {
  return (
    <div className="max-w-4xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Teacher Performance</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Based on class attendance, average scores, and feedback</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[12px] text-slate-400 dark:text-slate-500">
              <th className="font-medium px-4 py-3">Teacher</th>
              <th className="font-medium px-4 py-3">Sections</th>
              <th className="font-medium px-4 py-3">Avg attendance</th>
              <th className="font-medium px-4 py-3">Avg score</th>
              <th className="font-medium px-4 py-3">Rating</th>
            </tr>
          </thead>
          <tbody>
            {TEACHERS_PERFORMANCE.map((t) => (
              <tr key={t.name} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={t.name} size={28} />
                    <div>
                      <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{t.name}</div>
                      <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{t.subject}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{t.sections}</td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{t.avgAttendance}%</td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{t.avgScore}%</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-[13px] font-medium text-amber-600">
                    <Star size={13} className="fill-amber-400 text-amber-400" /> {t.rating}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   RISK STUDENTS
--------------------------------------------------------- */

function RiskStudentsScreen({ onOpenTimeline }) {
  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Risk Students</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Students flagged for attendance, fee, or academic concerns</p>
      </div>

      <div className="space-y-2.5">
        {RISK_STUDENTS.map((s) => (
          <button key={s.name} onClick={() => onOpenTimeline(s)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3 text-left hover:border-slate-300">
            <Avatar name={s.name} size={34} />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{s.name}</div>
              <div className="text-[12px] text-slate-400 dark:text-slate-500 mb-2">{s.cls}</div>
              <div className="flex flex-wrap gap-1.5">
                {s.flags.map((f, idx) => (
                  <span key={idx} className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                    <TrendingDown size={11} /> {f}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight size={15} className="text-slate-300 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   TRANSFER REQUESTS
--------------------------------------------------------- */

function TransferRequestsScreen({ requests, onRespond }) {
  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Transfer Requests</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Transfer certificate and school-change requests</p>
      </div>

      <div className="space-y-2.5">
        {requests.map((r) => (
          <div key={r.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <Avatar name={r.name} size={36} />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{r.name}</div>
              <div className="text-[12px] text-slate-400 dark:text-slate-500">{r.cls} &middot; Requested {r.requestedOn}</div>
              <div className="text-[12.5px] text-slate-600 dark:text-slate-300 mt-1">{r.reason}</div>
            </div>
            {r.status === "pending" ? (
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => onRespond(r.name, "approved")} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100">
                  <Check size={15} />
                </button>
                <button onClick={() => onRespond(r.name, "declined")} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100">
                  <XCircle size={15} />
                </button>
              </div>
            ) : (
              <span className={`text-[11.5px] font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${r.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                {r.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SUPER ADMIN DASHBOARD
--------------------------------------------------------- */

function SuperAdminDashboard({ schools, schoolPlans, onOpenSchool, onAddSchool, onActivateSchool }) {
  const totalStudents = schools.reduce((s, sc) => s + sc.students, 0);
  const totalMrr = schools.reduce((s, sc) => s + (schoolPlans[sc.id]?.mrr || 0), 0);
  const maxStudents = Math.max(...schools.map((s) => s.students), 1);
  const pendingCount = schools.filter((s) => s.agreementStatus === "pending").length;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Platform Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">All schools on Vedaalay, including pending agreements</p>
        </div>
        <button
          onClick={onAddSchool}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-2 text-[13.5px] font-medium"
        >
          <PlusCircle size={15} /> Add school
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Schools onboarded" value={schools.length} icon={Building2} tint="#4F46E5" />
        <KpiCard label="Students across platform" value={totalStudents.toLocaleString("en-IN")} icon={Users} tint="#0EA5A0" />
        <KpiCard label="Monthly recurring revenue" value={`Rs ${totalMrr.toLocaleString("en-IN")}`} icon={IndianRupee} tint="#059669" />
        <KpiCard label="Pending agreement" value={pendingCount} icon={AlertCircle} tint="#D97706" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px]">Schools</h3>
        </div>
        <div className="overflow-x-auto">
<table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[12px] text-slate-400 dark:text-slate-500">
              <th className="font-medium px-4 py-3">School</th>
              <th className="font-medium px-4 py-3">Students</th>
              <th className="font-medium px-4 py-3">Plan</th>
              <th className="font-medium px-4 py-3">MRR</th>
              <th className="font-medium px-4 py-3">Agreement</th>
              <th className="font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {schools.map((s) => {
              const plan = schoolPlans[s.id] || { plan: "Starter", mrr: 8000, status: "Trial" };
              const cap = PLAN_STUDENT_CAP[plan.plan] || Infinity;
              const overCap = s.students > cap;
              const isPending = s.agreementStatus === "pending";
              return (
                <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onOpenSchool(s)}>
                    <div className="flex items-center gap-2.5">
                      <SchoolLogo school={s} size={32} rounded="rounded-lg" />
                      <div>
                        <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{s.name}</div>
                        <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{s.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onOpenSchool(s)}>
                    <div className="flex items-center gap-2 w-32">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${overCap ? "bg-rose-500" : "bg-indigo-500"}`} style={{ width: `${(s.students / maxStudents) * 100}%` }} />
                      </div>
                      <span className="text-[12px] text-slate-500 dark:text-slate-400 w-10 shrink-0">{s.students}</span>
                    </div>
                    {overCap && <div className="text-[10.5px] text-rose-500 mt-1">Over {plan.plan} cap ({cap})</div>}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer" onClick={() => onOpenSchool(s)}>{plan.plan}</td>
                  <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer" onClick={() => onOpenSchool(s)}>Rs {plan.mrr.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-full ${isPending ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                      {isPending ? "Pending Agreement" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isPending && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onActivateSchool(s.id); }}
                        className="text-[12px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 whitespace-nowrap"
                      >
                        Activate &rarr;
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
</div>
      </div>
    </div>
  );
}

function BillingScreen({ schools, schoolPlans, invoices, onGenerateInvoice, onMarkInvoicePaid }) {
  const [genSchoolId, setGenSchoolId] = useState(schools[0]?.id || "");
  const totalMrr = schools.reduce((s, sc) => s + (schoolPlans[sc.id]?.mrr || 0), 0);
  const overdueAmount = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const awaitingCount = invoices.filter((i) => i.status === "sent" || i.status === "overdue").length;
  const INVOICE_STATUS_STYLE = { paid: "bg-emerald-50 text-emerald-700", sent: "bg-indigo-50 text-indigo-700", overdue: "bg-rose-50 text-rose-600" };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Billing & Invoicing</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Plan status and invoice history across schools</p>
        </div>
        <div className="flex gap-2">
          <select value={genSchoolId} onChange={(e) => setGenSchoolId(e.target.value)} className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-900 outline-none focus:border-indigo-300 dark:text-slate-100">
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button
            onClick={() => onGenerateInvoice(genSchoolId)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-2 text-[13.5px] font-medium whitespace-nowrap"
          >
            <PlusCircle size={15} /> Generate invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <KpiCard label="Monthly recurring revenue" value={`Rs ${totalMrr.toLocaleString("en-IN")}`} icon={IndianRupee} tint="#059669" />
        <KpiCard label="Overdue amount" value={`Rs ${overdueAmount.toLocaleString("en-IN")}`} icon={AlertTriangle} tint="#DC2626" />
        <KpiCard label="Invoices awaiting payment" value={awaitingCount} icon={FileText} tint="#D97706" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px]">Plans</h3>
        </div>
        <div className="overflow-x-auto">
<table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[12px] text-slate-400 dark:text-slate-500">
                  <th className="font-medium px-4 py-3">School</th>
                  <th className="font-medium px-4 py-3">Plan</th>
                  <th className="font-medium px-4 py-3">MRR</th>
                  <th className="font-medium px-4 py-3">Renewal</th>
                  <th className="font-medium px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((s) => {
                  const plan = schoolPlans[s.id] || { plan: "Starter", mrr: 8000, status: "Trial", renewal: "TBD" };
                  return (
                    <tr key={s.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3 text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{s.name}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{plan.plan}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">Rs {plan.mrr.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-500 dark:text-slate-400">{plan.renewal}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-full ${plan.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{plan.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
</div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[14.5px]">All invoices</h3>
        </div>
        <div className="overflow-x-auto">
<table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[12px] text-slate-400 dark:text-slate-500">
                  <th className="font-medium px-4 py-3">Invoice</th>
                  <th className="font-medium px-4 py-3">School</th>
                  <th className="font-medium px-4 py-3">Amount</th>
                  <th className="font-medium px-4 py-3">Due</th>
                  <th className="font-medium px-4 py-3">Status</th>
                  <th className="font-medium px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const sc = schools.find((s) => s.id === inv.schoolId);
                  return (
                    <tr key={inv.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{inv.id}</td>
                      <td className="px-4 py-3 text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{sc ? sc.name : inv.schoolId}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">Rs {inv.amount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-[13px] text-slate-500 dark:text-slate-400">{inv.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-full capitalize ${INVOICE_STATUS_STYLE[inv.status]}`}>{inv.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {inv.status !== "paid" && (
                          <button onClick={() => onMarkInvoicePaid(inv.id)} className="text-[12px] font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                            Mark paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
</div>
      </div>
    </div>
  );
}

function SchoolDetailDrawer({ school, plan, invoices, onClose, onActivateSchool, onUpdateBranding, onGenerateInvoice, onMarkInvoicePaid }) {
  if (!school) return null;
  const isPending = school.agreementStatus === "pending";
  const cap = PLAN_STUDENT_CAP[plan.plan] || Infinity;
  const usagePct = cap === Infinity ? 0 : Math.min((school.students / cap) * 100, 100);
  const overCap = school.students > cap;
  const schoolInvoices = invoices.filter((inv) => inv.schoolId === school.id);
  const INVOICE_STATUS_STYLE = { paid: "bg-emerald-50 text-emerald-700", sent: "bg-indigo-50 text-indigo-700", overdue: "bg-rose-50 text-rose-600" };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
          <span className="text-[12.5px] text-slate-400 dark:text-slate-500 font-medium">School detail</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <SchoolLogo school={school} size={48} rounded="rounded-xl" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-[16px]">{school.name}</div>
              <div className="text-slate-500 dark:text-slate-400 text-[13px]">{school.city}</div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-5">
            <div className="text-[12.5px] font-medium text-slate-600 dark:text-slate-300 mb-3">Branding</div>
            <SchoolBanner school={school} className="w-full h-20 rounded-lg mb-3" />
            <div className="flex items-start gap-3 mb-4">
              <SchoolLogo school={school} size={40} rounded="rounded-lg" />
              <div className="flex-1">
                <BrandingField
                  label="Logo"
                  currentUrl={school.logoUrl}
                  onChange={(url) => onUpdateBranding(school.id, { logoUrl: url })}
                />
              </div>
            </div>
            <BrandingField
              label="Banner"
              currentUrl={school.bannerUrl}
              onChange={(url) => onUpdateBranding(school.id, { bannerUrl: url })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 text-center">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">{school.students.toLocaleString("en-IN")}</div>
              <div className="text-[11.5px] text-slate-400 dark:text-slate-500">Students</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3.5 text-center">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">Rs {plan.mrr.toLocaleString("en-IN")}</div>
              <div className="text-[11.5px] text-slate-400 dark:text-slate-500">MRR</div>
            </div>
          </div>

          {cap !== Infinity && (
            <div className="mb-5">
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="text-slate-500 dark:text-slate-400">{plan.plan} plan usage</span>
                <span className={overCap ? "text-rose-500 font-medium" : "text-slate-500 dark:text-slate-400"}>{school.students} / {cap}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${overCap ? "bg-rose-500" : "bg-indigo-500"}`} style={{ width: `${usagePct}%` }} />
              </div>
              {overCap && <p className="text-[11.5px] text-rose-500 mt-1.5">Over plan capacity — good candidate for an upgrade conversation.</p>}
            </div>
          )}

          <div className="space-y-2.5 text-[13px] mb-5">
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Principal</span><span className="text-slate-700 dark:text-slate-200 font-medium">{school.principal}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Plan</span><span className="text-slate-700 dark:text-slate-200 font-medium">{plan.plan}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Billing status</span><span className="text-slate-700 dark:text-slate-200 font-medium">{plan.status}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 dark:text-slate-500">Renewal date</span><span className="text-slate-700 dark:text-slate-200 font-medium">{plan.renewal}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-slate-500">Agreement</span>
              <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-full ${isPending ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                {isPending ? "Pending Agreement" : "Active"}
              </span>
            </div>
          </div>

          {isPending && (
            <button
              onClick={() => onActivateSchool(school.id)}
              className="w-full mb-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium"
            >
              Activate school
            </button>
          )}

          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Invoices</div>
            <button onClick={() => onGenerateInvoice(school.id)} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-[12px] font-medium">
              <PlusCircle size={12} /> Generate
            </button>
          </div>
          <div className="space-y-2">
            {schoolInvoices.length === 0 && <p className="text-slate-400 dark:text-slate-500 text-[13px]">No invoices yet.</p>}
            {schoolInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center gap-2.5 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium text-slate-800 dark:text-slate-100">{inv.id} &middot; Rs {inv.amount.toLocaleString("en-IN")}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">Due {inv.dueDate}</div>
                </div>
                {inv.status === "paid" ? (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">Paid</span>
                ) : (
                  <button
                    onClick={() => onMarkInvoicePaid(inv.id)}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${INVOICE_STATUS_STYLE[inv.status]}`}
                  >
                    {inv.status === "overdue" ? "Overdue · Mark paid" : "Sent · Mark paid"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddSchoolModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", city: "", principal: "", logoUrl: null, bannerUrl: null });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white text-[15px]">Onboard a new school</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">School name</label>
            <input value={form.name} onChange={set("name")} placeholder="e.g. Oakwood International School" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">City</label>
            <input value={form.city} onChange={set("city")} placeholder="e.g. Prayagraj, Uttar Pradesh" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Principal</label>
            <input value={form.principal} onChange={set("principal")} placeholder="e.g. Dr. Meera Nair" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-center gap-2 mb-1.5">
                {form.logoUrl ? <img src={form.logoUrl} alt="Logo preview" className="w-8 h-8 rounded-lg object-cover" /> : <ImageIcon size={16} className="text-slate-400" />}
                <span className="text-[12px] text-slate-500 dark:text-slate-400">Logo (optional)</span>
              </div>
              <BrandingField label="Logo" currentUrl={form.logoUrl} onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))} />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1.5">
                {form.bannerUrl ? <img src={form.bannerUrl} alt="Banner preview" className="w-8 h-8 rounded-lg object-cover" /> : <ImageIcon size={16} className="text-slate-400" />}
                <span className="text-[12px] text-slate-500 dark:text-slate-400">Banner (optional)</span>
              </div>
              <BrandingField label="Banner" currentUrl={form.bannerUrl} onChange={(url) => setForm((f) => ({ ...f, bannerUrl: url }))} />
            </div>
          </div>
          <p className="text-[12px] text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            The school will be created with a Pending Agreement status — invisible to Find a School and Staff Sign In until you activate it.
          </p>
        </div>
        <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 text-[13.5px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
          <button
            onClick={() => { if (!form.name.trim()) return; onCreate(form); }}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium"
          >
            Create school
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SCHOOL ADMIN
--------------------------------------------------------- */

function SchoolAdminDashboard({ school, staff, notices, onNavigate, sections }) {
  const sectionRows = sections && sections.length ? sections : SECTION_MANAGER_DATA;
  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">School Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">{school.name}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Staff members" value={staff.length} icon={Briefcase} tint="#4F46E5" />
        <KpiCard label="Classes & sections" value={sectionRows.length} icon={Layers} tint="#0EA5A0" />
        <KpiCard label="Fee heads configured" value={FEE_STRUCTURE_ADMIN_INITIAL.length} icon={IndianRupee} tint="#059669" />
        <KpiCard label="Notices this month" value={notices.length} icon={Megaphone} tint="#D97706" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { id: "staff", label: "Staff Directory", desc: "Manage teachers and admission staff", icon: Briefcase },
          { id: "classes", label: "Class & Section Manager", desc: "Capacity and class-teacher assignment", icon: Layers },
          { id: "transport", label: "Transport", desc: "Bus routes, drivers, and seat capacity", icon: RouteIcon },
          { id: "hostel", label: "Hostel", desc: "Hostel blocks, wardens, and occupancy", icon: BedDouble },
          { id: "fees", label: "Fee Structure Setup", desc: "Configure fee heads and amounts", icon: IndianRupee },
          { id: "notices", label: "Notices & Announcements", desc: "Publish updates to parents", icon: Megaphone },
          { id: "settings", label: "School Settings", desc: "Branding, address, academic year", icon: Settings },
        ].map((c) => (
          <button key={c.id} onClick={() => onNavigate(c.id)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left hover:border-slate-300 hover:shadow-sm transition-all">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3"><c.icon size={16} /></div>
            <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{c.label}</div>
            <div className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">{c.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StaffDirectoryScreen({ staff, onAddStaff }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "Teacher", subject: "", email: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Staff Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">{staff.length} staff members</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-2 text-[13.5px] font-medium">
          <Plus size={15} /> Add staff
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-5">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Full name</label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. Ms. Pooja Nigam" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Role</label>
              <select value={form.role} onChange={set("role")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] bg-white dark:bg-slate-900 outline-none focus:border-indigo-300 dark:text-slate-100">
                {["Teacher", "Admission Counselor", "Coordinator", "Principal"].map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Subject / department</label>
              <input value={form.subject} onChange={set("subject")} placeholder="e.g. Science" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Email</label>
              <input value={form.email} onChange={set("email")} placeholder="name@greenvalley.edu" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 text-[13.5px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            <button
              onClick={() => { if (!form.name.trim()) return; onAddStaff(form); setForm({ name: "", role: "Teacher", subject: "", email: "" }); setShowForm(false); }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium"
            >
              Add staff member
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[12px] text-slate-400 dark:text-slate-500">
              <th className="font-medium px-4 py-3">Name</th>
              <th className="font-medium px-4 py-3">Role</th>
              <th className="font-medium px-4 py-3">Subject / dept.</th>
              <th className="font-medium px-4 py-3">Email</th>
              <th className="font-medium px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s, idx) => (
              <tr key={idx} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={s.name} size={28} />
                    <span className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{s.role}</td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{s.subject}</td>
                <td className="px-4 py-3 text-[12.5px] text-slate-400 dark:text-slate-500">{s.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-full ${s.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>
    </div>
  );
}

function ClassSectionManagerScreen({ sections }) {
  const rows = sections && sections.length ? sections : SECTION_MANAGER_DATA;
  return (
    <div className="max-w-4xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Class & Section Manager</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Capacity and class-teacher assignment</p>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[12px] text-slate-400 dark:text-slate-500">
              <th className="font-medium px-4 py-3">Class</th>
              <th className="font-medium px-4 py-3">Section</th>
              <th className="font-medium px-4 py-3">Class teacher</th>
              <th className="font-medium px-4 py-3">Strength</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.cls}-${r.section}`} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 text-[13.5px] text-slate-700 dark:text-slate-200">{r.cls}</td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">Section {r.section}</td>
                <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{r.teacher}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 w-32">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-teal-500" style={{ width: `${(r.strength / r.capacity) * 100}%` }} />
                    </div>
                    <span className="text-[12px] text-slate-500 dark:text-slate-400 w-10 shrink-0">{r.strength}/{r.capacity}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
</div>
      </div>
    </div>
  );
}

function FeeStructureScreen({ feeHeads, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");

  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Fee Structure Setup</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Configure fee heads applied across the school</p>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-50">
        {feeHeads.map((f) => (
          <div key={f.id} className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Wallet size={16} /></div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{f.head}</div>
              <div className="text-[12px] text-slate-400 dark:text-slate-500">{f.term}</div>
            </div>
            {editingId === f.id ? (
              <div className="flex items-center gap-2 shrink-0">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-24 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-indigo-300 dark:text-slate-100"
                />
                <button
                  onClick={() => { onUpdate(f.id, Number(draft) || f.amount); setEditingId(null); }}
                  className="text-indigo-600 text-[12.5px] font-medium"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-[13.5px] font-semibold text-slate-700 dark:text-slate-200">Rs {f.amount.toLocaleString("en-IN")}</span>
                <button onClick={() => { setEditingId(f.id); setDraft(String(f.amount)); }} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600">
                  <Edit3 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NoticesComposerScreen({ notices, onPost }) {
  const [title, setTitle] = useState("");
  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Notices & Announcements</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Published notices appear instantly on every parent's dashboard</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-5">
        <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">New notice</label>
        <textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={2} placeholder="e.g. PTA meeting scheduled for 22 Aug" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 resize-none mb-3 dark:text-slate-100" />
        <button
          onClick={() => { if (!title.trim()) return; onPost(title); setTitle(""); }}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-2 text-[13.5px] font-medium"
        >
          <Megaphone size={14} /> Publish notice
        </button>
      </div>

      <div className="space-y-2.5">
        {notices.map((n, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Megaphone size={14} /></div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{n.title}</div>
              <div className="text-[11.5px] text-slate-400 dark:text-slate-500">{n.date}</div>
            </div>
            <a
              href={buildWhatsAppLink("", `${n.title} — Vedaalay School Notice`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap shrink-0"
            >
              <Share2 size={13} /> Share
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransportScreen({ routes, onAddRoute }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", busNumber: "", driver: "", capacity: "40", stops: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Transport</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">{routes.length} active bus routes</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-2 text-[13.5px] font-medium">
          <Plus size={15} /> Add route
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-5">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Route name</label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. Route 5 - Chinhat" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Bus number</label>
              <input value={form.busNumber} onChange={set("busNumber")} placeholder="e.g. UP32 AF 1234" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Driver name</label>
              <input value={form.driver} onChange={set("driver")} placeholder="e.g. Mr. Suresh Pal" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Seating capacity</label>
              <input type="number" value={form.capacity} onChange={set("capacity")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Stops (comma separated)</label>
            <input value={form.stops} onChange={set("stops")} placeholder="e.g. Chinhat Crossing, Faizabad Road" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 text-[13.5px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            <button
              onClick={() => {
                if (!form.name.trim() || !form.busNumber.trim()) return;
                onAddRoute({ ...form, capacity: Number(form.capacity) || 40, stops: form.stops.split(",").map((s) => s.trim()).filter(Boolean) });
                setForm({ name: "", busNumber: "", driver: "", capacity: "40", stops: "" });
                setShowForm(false);
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium"
            >
              Add route
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {routes.map((r) => {
          const pct = (r.assigned / r.capacity) * 100;
          const near = pct > 90;
          return (
            <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <RouteIcon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{r.name}</div>
                    <span className="text-[11.5px] text-slate-400 dark:text-slate-500">{r.busNumber}</span>
                  </div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Driver: {r.driver}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.stops.map((s, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 mt-3">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-xs">
                      <div className={`h-full rounded-full ${near ? "bg-amber-500" : "bg-teal-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[12px] text-slate-500 dark:text-slate-400 shrink-0">{r.assigned}/{r.capacity} seats</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HostelScreen({ blocks, onAddBlock }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", warden: "", totalRooms: "30", capacityPerRoom: "3" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Hostel</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">{blocks.length} hostel blocks</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-2 text-[13.5px] font-medium">
          <Plus size={15} /> Add block
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-5">
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Block name</label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. Boys Hostel - Block C" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Warden</label>
              <input value={form.warden} onChange={set("warden")} placeholder="e.g. Mr. Ramesh Yadav" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Total rooms</label>
              <input type="number" value={form.totalRooms} onChange={set("totalRooms")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Capacity per room</label>
              <input type="number" value={form.capacityPerRoom} onChange={set("capacityPerRoom")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 text-[13.5px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            <button
              onClick={() => {
                if (!form.name.trim() || !form.warden.trim()) return;
                onAddBlock({ ...form, totalRooms: Number(form.totalRooms) || 30, capacityPerRoom: Number(form.capacityPerRoom) || 3, occupiedRooms: 0 });
                setForm({ name: "", warden: "", totalRooms: "30", capacityPerRoom: "3" });
                setShowForm(false);
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium"
            >
              Add block
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {blocks.map((b) => {
          const totalCapacity = b.totalRooms * b.capacityPerRoom;
          const occupied = b.occupiedRooms * b.capacityPerRoom;
          const pct = (occupied / totalCapacity) * 100;
          const near = pct > 90;
          return (
            <div key={b.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <BedDouble size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{b.name}</div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Warden: {b.warden}</div>
                  <div className="flex items-center gap-2.5 mt-3">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-xs">
                      <div className={`h-full rounded-full ${near ? "bg-amber-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[12px] text-slate-500 dark:text-slate-400 shrink-0">{occupied}/{totalCapacity} beds &middot; {b.occupiedRooms}/{b.totalRooms} rooms</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SchoolSettingsScreen({ school, onUpdateBranding }) {
  const [form, setForm] = useState({ name: school.name, city: school.city, principal: school.principal });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-lg">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">School Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">Branding and basic school information</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-slate-600 dark:text-slate-300 mb-4"><Palette size={13} /> Branding</div>

        <SchoolBanner school={school} className="w-full h-24 rounded-xl mb-3" />
        <div className="mb-4">
          <BrandingField
            label="Banner"
            currentUrl={school.bannerUrl}
            onChange={(url) => onUpdateBranding(school.id, { bannerUrl: url })}
          />
        </div>

        <div className="flex items-start gap-3">
          <SchoolLogo school={school} size={48} rounded="rounded-xl" />
          <div className="flex-1">
            <BrandingField
              label="Logo"
              currentUrl={school.logoUrl}
              onChange={(url) => onUpdateBranding(school.id, { logoUrl: url })}
            />
          </div>
        </div>
        <p className="text-[11.5px] text-slate-400 dark:text-slate-500 mt-3">
          This logo and banner appear on Find a School, sign-in screens, and your dashboard header.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
        <div>
          <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">School name</label>
          <input value={form.name} onChange={set("name")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
        </div>
        <div>
          <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">City / address</label>
          <input value={form.city} onChange={set("city")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
        </div>
        <div>
          <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Principal</label>
          <input value={form.principal} onChange={set("principal")} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-indigo-300 dark:text-slate-100" />
        </div>
        <div>
          <label className="text-[13px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">Academic year</label>
          <select defaultValue="2026-27" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13.5px] bg-white dark:bg-slate-900 outline-none focus:border-indigo-300 dark:text-slate-100">
            {ACADEMIC_YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-[13.5px] font-medium mt-2">Save changes</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   UNIVERSAL STUDENT TIMELINE
--------------------------------------------------------- */

function buildChildActivity(child, behaviourNotes, feeInstallments, leaveRequests, ptmBooked) {
  const activity = [];
  (behaviourNotes[child.id] || []).forEach((n) => {
    activity.push({
      date: n.date, title: n.tone === "positive" ? "Positive behaviour note" : "Behaviour concern noted",
      desc: n.text, icon: n.tone === "positive" ? Award : AlertCircle, tint: n.tone === "positive" ? "#059669" : "#D97706",
    });
  });
  feeInstallments.filter((f) => f.status === "paid").forEach((f) => {
    activity.push({ date: f.dueDate, title: `Fee paid: ${f.name}`, desc: `Rs ${f.amount.toLocaleString("en-IN")}`, icon: Wallet, tint: "#059669" });
  });
  leaveRequests.filter((l) => l.studentName === child.name).forEach((l) => {
    activity.push({
      date: `${l.fromDate} - ${l.toDate}`, title: `Leave request (${l.status})`, desc: l.reason,
      icon: CalendarDays, tint: l.status === "approved" ? "#059669" : l.status === "declined" ? "#DC2626" : "#D97706",
    });
  });
  if (ptmBooked) activity.push({ date: "Upcoming", title: "PTM booked", desc: ptmBooked, icon: CalendarPlus, tint: "#4F46E5" });
  return activity;
}

function buildCoordinatorStudentTimeline(student, inquiries) {
  const inquiry = inquiries.find((i) => i.id === student.inquiryId);
  const STAGE_ICONS = { new: ClipboardList, contacted: PhoneCall, meeting: CalendarCheck, visited: MapPin, interested: Star, test: FileCheck2, qualified: CheckCircle2, fee: IndianRupee, confirmed: CheckCircle2 };
  let milestones = [];
  if (inquiry) {
    const upto = STAGES.findIndex((s) => s.id === inquiry.stage);
    milestones = STAGES.slice(0, upto + 1).map((s) => ({
      date: s.id === "new" ? `${inquiry.createdDaysAgo} days ago` : "", title: s.label,
      desc: s.id === "confirmed" ? `Admission confirmed for ${student.classApplied}.` : `Inquiry moved to "${s.label}".`,
      icon: STAGE_ICONS[s.id] || ClipboardList,
    }));
  }
  if (student.allocated || student.section) {
    milestones.push({
      date: "", title: "Section Allocated",
      desc: `Allocated to ${student.classApplied} - ${student.section}, ${student.house?.split(" (")[0] || ""}, class teacher ${student.classTeacher}.`,
      icon: Layers,
    });
  }
  return { milestones, activity: [], status: student.status, subtitle: `${student.classApplied}${student.section ? " - " + student.section : ""}` };
}

function buildRosterTimeline(rosterStudent, behaviourNotes) {
  const milestones = [{ date: "", title: "Currently Enrolled", desc: `${rosterStudent.section}, ${rosterStudent.house.split(" (")[0]}, Roll No. ${rosterStudent.rollNumber}.`, icon: Layers }];
  const activity = (behaviourNotes[rosterStudent.id] || []).map((n) => ({
    date: n.date, title: n.tone === "positive" ? "Positive behaviour note" : "Behaviour concern noted",
    desc: n.text, icon: n.tone === "positive" ? Award : AlertCircle, tint: n.tone === "positive" ? "#059669" : "#D97706",
  }));
  return { milestones, activity, status: "Active Student", subtitle: `${rosterStudent.section} \u00b7 Roll No. ${rosterStudent.rollNumber}` };
}

function buildRiskStudentTimeline(riskStudent) {
  const milestones = [{ date: "", title: "Active Student", desc: riskStudent.cls, icon: UserCheck }];
  const activity = riskStudent.flags.map((f) => ({ date: "Flagged", title: "Risk flag raised", desc: f, icon: AlertTriangle, tint: "#DC2626" }));
  return { milestones, activity, status: "Active Student", subtitle: riskStudent.cls };
}

function TimelineContent({ name, subtitle, status, milestones, activity }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Avatar name={name} size={44} />
        <div>
          <div className="font-semibold text-slate-900 dark:text-white text-[16px]">{name}</div>
          <div className="text-slate-500 dark:text-slate-400 text-[13px]">{subtitle}</div>
        </div>
      </div>
      <div className="mb-6"><StudentStatusPill status={status} /></div>

      <div className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wide flex items-center gap-1.5">
        <History size={13} /> Journey
      </div>
      <div className="flex flex-col mb-6">
        {milestones.map((m, idx) => {
          const isLast = idx === milestones.length - 1;
          const Icon = m.icon;
          return (
            <div key={idx} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Icon size={13} />
                </div>
                {!isLast && <div className="w-0.5 h-full min-h-[24px] bg-slate-150 flex-1" style={{ background: "#E2E8F0" }} />}
              </div>
              <div className={`pb-5 ${isLast ? "" : ""}`}>
                <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{m.title}</div>
                {m.date && <div className="text-[11.5px] text-slate-400 dark:text-slate-500 mb-0.5">{m.date}</div>}
                <div className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {activity.length > 0 && (
        <>
          <div className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wide">Recent Activity</div>
          <div className="space-y-3">
            {activity.map((a, idx) => {
              const Icon = a.icon;
              return (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: (a.tint || "#4F46E5") + "1a", color: a.tint || "#4F46E5" }}>
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{a.title}</div>
                    <div className="text-[12px] text-slate-500 dark:text-slate-400">{a.desc}</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{a.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function TimelineDrawer({ onClose, ...contentProps }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <span className="text-[12.5px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5"><History size={13} /> Student Timeline</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <TimelineContent {...contentProps} />
        </div>
      </div>
    </div>
  );
}

function TimelineScreen({ name, subtitle, status, milestones, activity }) {
  return (
    <div className="max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Student Timeline</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[13.5px] mt-0.5">The complete journey, from first inquiry to today</p>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <TimelineContent name={name} subtitle={subtitle} status={status} milestones={milestones} activity={activity} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ROOT APP
--------------------------------------------------------- */

const NAV_CONFIG = {
  counselor: [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "funnel", label: "Admission Funnel", icon: TrendingUp },
    { id: "inquiries", label: "All Inquiries", icon: ClipboardList },
    { id: "calendar", label: "Calendar", icon: Calendar },
  ],
  coordinator: [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "capacity", label: "Section Capacity", icon: Layers },
  ],
  teacher: [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "attendance", label: "Attendance", icon: ClipboardCheck },
    { id: "homework", label: "Homework", icon: BookOpen },
    { id: "gradebook", label: "Gradebook", icon: Trophy },
    { id: "students", label: "My Students", icon: Users },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "leave", label: "Leave Requests", icon: CalendarDays },
  ],
  student: [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "homework", label: "Homework", icon: BookOpen },
    { id: "results", label: "Results", icon: Trophy },
    { id: "fees", label: "Fees", icon: IndianRupee },
    { id: "campus", label: "Campus Life", icon: Award },
    { id: "timeline", label: "My Timeline", icon: History },
  ],
  parent: [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "fees", label: "Fees", icon: IndianRupee },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "leaveptm", label: "Leave & PTM", icon: CalendarPlus },
    { id: "timeline", label: "Child's Timeline", icon: History },
  ],
  principal: [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "fees", label: "Fee Collection", icon: IndianRupee },
    { id: "strength", label: "Student Strength", icon: BarChart3 },
    { id: "teachers", label: "Teacher Performance", icon: Award },
    { id: "risk", label: "Risk Students", icon: AlertTriangle },
    { id: "transfers", label: "Transfer Requests", icon: ArrowRightLeft },
  ],
  admin: [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "staff", label: "Staff Directory", icon: Briefcase },
    { id: "classes", label: "Class & Sections", icon: Layers },
    { id: "transport", label: "Transport", icon: RouteIcon },
    { id: "hostel", label: "Hostel", icon: BedDouble },
    { id: "fees", label: "Fee Structure", icon: IndianRupee },
    { id: "notices", label: "Notices", icon: Megaphone },
    { id: "settings", label: "School Settings", icon: Settings },
  ],
  superadmin: [
    { id: "dashboard", label: "Platform Overview", icon: Building2 },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
  ],
};

const PERSON_NAMES = {
  counselor: "Priya Sharma",
  coordinator: "Ritu Mathur",
  teacher: TEACHER_NAME,
  student: CHILD.name,
  parent: `${CHILD.name.split(" ")[1]} Family`,
  principal: "Dr. Anjali Mehra",
  admin: "Mr. Vikram Ahluwalia",
  superadmin: "Platform Admin",
};

const SEARCH_PLACEHOLDERS = {
  counselor: "Search inquiries...",
  coordinator: "Search students...",
  teacher: "Search students...",
  principal: "Search defaulters, risk students, teachers...",
  admin: "Search staff...",
  superadmin: "Search schools...",
  parent: "Search your children...",
  student: "Search your homework...",
};

const ROLE_ICONS = {
  principal: GraduationCap, teacher: Users, parent: Users,
  student: GraduationCap, admin: Settings, superadmin: Building2,
};

/* ---------------------------------------------------------
   STUDENT ID CARD
--------------------------------------------------------- */

function StudentIDCard({ student, school }) {
  const brand = school?.color || "#4F46E5";
  const brandSoft = school?.colorSoft || "#EEF2FF";
  const admissionNo = student.admissionNo || `${(school?.logo || "STU")}-${new Date().getFullYear()}-${String(student.id).replace(/\D/g, "").slice(-4).padStart(4, "0")}`;
  const rollNo = student.rollNumber || "To be assigned";
  const validTill = `31 Mar ${new Date().getFullYear() + 1}`;
  const initials = student.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const qrData = encodeURIComponent(
    `VEDAALAY-ID\nSchool: ${school?.name || ""}\nStudent: ${student.name}\nAdmission No: ${admissionNo}\nRoll No: ${rollNo}\nClass: ${student.classApplied}${student.section ? " · " + student.section : ""}\nPhone: ${student.phone}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${qrData}`;

  return (
    <div
      className="relative w-[340px] rounded-[26px] overflow-hidden shadow-2xl bg-white"
      style={{ boxShadow: `0 30px 60px -20px ${brand}55, 0 10px 30px -10px rgba(0,0,0,0.25)` }}
    >
      {/* Lanyard notch */}
      <div className="flex justify-center pt-3">
        <div className="w-16 h-3 rounded-full bg-slate-200" />
      </div>
      <div className="flex justify-center -mt-1">
        <div className="w-6 h-6 rounded-full border-4 border-slate-200 bg-white" />
      </div>

      {/* Header band */}
      <div
        className="relative px-5 pt-4 pb-14 text-white"
        style={{
          background: `linear-gradient(135deg, ${brand} 0%, ${brand} 60%, color-mix(in oklab, ${brand} 70%, black) 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.4) 0, transparent 40%)" }} />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/95 flex items-center justify-center text-[15px] font-bold" style={{ color: brand }}>
            {school?.logo || "SC"}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-tight truncate">{school?.name || "School"}</div>
            <div className="text-[10.5px] opacity-80 truncate">{school?.city || ""}</div>
          </div>
        </div>
        <div className="relative mt-3 flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.18em] font-semibold opacity-90">Student Identity Card</div>
          <div className="text-[10px] uppercase tracking-[0.14em] opacity-80">{school?.board || "CBSE"}</div>
        </div>
      </div>

      {/* Avatar overlap */}
      <div className="relative flex justify-center -mt-12">
        <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
          {student.photo ? (
            <img src={student.photo} alt={student.name} className="w-full h-full rounded-xl object-cover" />
          ) : (
            <div
              className="w-full h-full rounded-xl flex items-center justify-center text-white text-2xl font-semibold"
              style={{ background: `linear-gradient(135deg, ${brand}, color-mix(in oklab, ${brand} 60%, black))` }}
            >
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="px-5 pt-3 text-center">
        <div className="text-[16.5px] font-semibold text-slate-900 leading-tight">{student.name}</div>
        <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: brandSoft, color: brand }}>
          <GraduationCap size={11} /> {student.classApplied}{student.section ? ` · ${student.section}` : ""}
        </div>
      </div>

      {/* Details */}
      <div className="px-5 pt-4 pb-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[10.5px]">
        <div>
          <div className="text-slate-400 uppercase tracking-wider text-[9px] font-medium">Admission No</div>
          <div className="text-slate-800 font-semibold">{admissionNo}</div>
        </div>
        <div>
          <div className="text-slate-400 uppercase tracking-wider text-[9px] font-medium">Roll No</div>
          <div className="text-slate-800 font-semibold">{rollNo}</div>
        </div>
        <div>
          <div className="text-slate-400 uppercase tracking-wider text-[9px] font-medium">Valid Till</div>
          <div className="text-slate-800 font-semibold">{validTill}</div>
        </div>
        <div>
          <div className="text-slate-400 uppercase tracking-wider text-[9px] font-medium">Blood Group</div>
          <div className="text-slate-800 font-semibold">{student.bloodGroup || "—"}</div>
        </div>
        <div>
          <div className="text-slate-400 uppercase tracking-wider text-[9px] font-medium">Guardian</div>
          <div className="text-slate-800 font-semibold truncate">{student.parentName}</div>
        </div>
        <div>
          <div className="text-slate-400 uppercase tracking-wider text-[9px] font-medium">Phone</div>
          <div className="text-slate-800 font-semibold truncate">{student.phone}</div>
        </div>
      </div>

      {/* QR + footer */}
      <div className="mx-5 mb-4 mt-1 flex items-center gap-3 rounded-xl p-3" style={{ background: brandSoft }}>
        <img src={qrUrl} alt="Student QR" className="w-16 h-16 rounded-md bg-white p-1" />
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: brand }}>Scan to verify</div>
          <div className="text-[10.5px] text-slate-600 leading-snug mt-0.5">This card is the property of {school?.name || "the school"}. If found, please return to the school office.</div>
        </div>
      </div>

      {/* Signature bar */}
      <div className="px-5 pb-4 flex items-end justify-between">
        <div className="text-[9.5px] text-slate-400">Issued {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
        <div className="text-right">
          <div className="w-24 h-6 border-b border-slate-300" />
          <div className="text-[9.5px] text-slate-500 mt-0.5">Principal</div>
        </div>
      </div>

      {/* Accent stripe */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${brand}, color-mix(in oklab, ${brand} 40%, white))` }} />
    </div>
  );
}

function IDCardModal({ student, school, onClose, isNew }) {
  if (!student) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500">
          <X size={16} />
        </button>
        <div className="flex items-center gap-2 mb-1">
          {isNew && <Sparkles size={16} className="text-amber-500" />}
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">
            {isNew ? "Admission confirmed — ID card generated" : "Student ID card"}
          </h2>
        </div>
        <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mb-5">
          {isNew ? `Welcome ${student.name}! The ID card is ready to print and hand over to the family.` : "Print or share this ID card with the family."}
        </p>
        <div className="flex justify-center py-2">
          <StudentIDCard student={student} school={school} />
        </div>
        {isNew && student.credentials && (
          <div className="mt-5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-900/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              <div className="text-[12.5px] font-semibold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide">Login credentials</div>
            </div>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mb-3">Share these with the family. They can change the password after first login.</p>
            <div className="grid grid-cols-2 gap-3 text-[11.5px]">
              <div className="rounded-lg bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-800 p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">Student login</div>
                <div className="font-mono text-slate-800 dark:text-slate-100 break-all">{student.credentials.studentUserId}</div>
                <div className="font-mono text-slate-500 dark:text-slate-400 break-all">{student.credentials.studentPassword}</div>
              </div>
              <div className="rounded-lg bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-800 p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">Parent login</div>
                <div className="font-mono text-slate-800 dark:text-slate-100 break-all">{student.credentials.parentUserId}</div>
                <div className="font-mono text-slate-500 dark:text-slate-400 break-all">{student.credentials.parentPassword}</div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 h-10 rounded-lg text-white text-[13px] font-medium flex items-center justify-center gap-2"
            style={{ background: school?.color || "#4F46E5" }}
          >
            <Printer size={14} /> Print card
          </button>
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SchoolOS() {

  const [school, setSchool] = useState(null);
  const [role, setRole] = useState(null);
  const [view, setView] = useState("dashboard");
  const [inquiries, setInquiries] = useState(makeInquiries);
  const [students, setStudents] = useState(() => deriveEnrolledStudents(inquiries));

  // Live roster from the database. Mock students stay in place; real rows are
  // merged on top once the user is signed in and their school has students.
  const { live: liveStudents } = useLiveStudents(!!role);
  useEffect(() => {
    if (!liveStudents.length) return;
    setStudents((prev) => [...liveStudents, ...prev.filter((s) => !s.isLive)]);
  }, [liveStudents]);

  // Live classes/sections (with real student counts) for the admin screens.
  const { live: liveSections } = useLiveSections(!!role);
  const [openInquiryId, setOpenInquiryId] = useState(null);
  const [openStudentId, setOpenStudentId] = useState(null);
  const [showNewInquiry, setShowNewInquiry] = useState(false);

  const [authChecked, setAuthChecked] = useState(false);

  // On first load, check for an existing Supabase session (e.g. the person
  // refreshed the page) and restore their role/school instead of bouncing
  // them back to the landing screen.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        if (!cancelled) setAuthChecked(true);
        return;
      }
      const profile = await fetchProfile(user.id);
      if (cancelled) return;
      if (profile) {
        const restoredRole = ROLE_BY_ID[profile.role];
        if (restoredRole) {
          setRole(restoredRole);
          if (profile.school_id) {
            const matchedSchool = SCHOOLS.find((s) => s.id === profile.school_id);
            if (matchedSchool) setSchool(matchedSchool);
          }
        }
      }
      setAuthChecked(true);
    }

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setRole(null);
        setSchool(null);
      }
    });

    return () => {
      cancelled = true;
      listener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [entryMode, setEntryMode] = useState("landing"); // landing | find | familyLogin | staffLogin | superAdminLogin
  const [publicStage, setPublicStage] = useState("browse");
  const [enquirySchool, setEnquirySchool] = useState(null);
  const [lastEnquiryRef, setLastEnquiryRef] = useState(null);

  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [homeworkList, setHomeworkList] = useState(makeInitialHomework);
  const [examMarks, setExamMarks] = useState({});
  const [leaveRequests, setLeaveRequests] = useState(makeInitialLeaveRequests);
  const [behaviourNotes, setBehaviourNotes] = useState({});
  const [attendanceSection, setAttendanceSection] = useState(TEACHER_SECTIONS[0]);
  const [openTeacherStudent, setOpenTeacherStudent] = useState(null);
  const todayKey = "2026-07-21";

  const [feeInstallmentsByChild, setFeeInstallmentsByChild] = useState(FEE_INSTALLMENTS_BY_CHILD_INITIAL);
  const [messages, setMessages] = useState([
    { from: "teacher", text: "Hello! Aarav did wonderfully in today's science quiz." },
    { from: "parent", text: "That's great to hear, thank you for letting us know!" },
  ]);
  const [ptmBookedByChild, setPtmBookedByChild] = useState({});
  const [selectedChildId, setSelectedChildId] = useState(CHILD.id);
  const selectedChild = CHILDREN.find((c) => c.id === selectedChildId) || CHILD;
  const [transferRequests, setTransferRequests] = useState(TRANSFER_REQUESTS);

  const [schoolsList, setSchoolsList] = useState(SCHOOLS);
  const [schoolPlans, setSchoolPlans] = useState(SCHOOL_PLANS_INITIAL);
  const [invoices, setInvoices] = useState(INVOICES_INITIAL);
  const [staffList, setStaffList] = useState(STAFF_DIRECTORY_INITIAL);

  // Live staff directory from the database; mock rows stay as fallback.
  const { live: liveStaff } = useLiveStaff(!!role);
  useEffect(() => {
    if (!liveStaff.length) return;
    setStaffList((prev) => [...liveStaff, ...prev.filter((s) => !s.isLive)]);
  }, [liveStaff]);

  const [feeHeads, setFeeHeads] = useState(FEE_STRUCTURE_ADMIN_INITIAL);
  const [transportRoutes, setTransportRoutes] = useState(TRANSPORT_ROUTES_INITIAL);
  const [hostelBlocks, setHostelBlocks] = useState(HOSTEL_BLOCKS_INITIAL);
  const [schoolNotices, setSchoolNotices] = useState(SCHOOL_NOTICES_INITIAL);
  const [openSchoolId, setOpenSchoolId] = useState(null);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [timelineDrawer, setTimelineDrawer] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [idCardStudentId, setIdCardStudentId] = useState(null);
  const [idCardIsNew, setIdCardIsNew] = useState(false);
  const [idCardOverride, setIdCardOverride] = useState(null);
  const idCardStudent = useMemo(() => idCardOverride || students.find((s) => s.id === idCardStudentId) || null, [students, idCardStudentId, idCardOverride]);

  const openSuperAdminSchool = useMemo(() => schoolsList.find((s) => s.id === openSchoolId) || null, [schoolsList, openSchoolId]);
  // Keeps the logged-in school's display data (logo/banner) in sync after Super Admin or School Admin updates branding
  const displaySchool = useMemo(() => (school ? schoolsList.find((s) => s.id === school.id) || school : null), [school, schoolsList]);
  // Find a School and Staff/Family Sign In only ever show schools whose agreement is Active
  const activeSchools = useMemo(() => schoolsList.filter((s) => s.agreementStatus === "active"), [schoolsList]);

  const openInquiry = useMemo(() => inquiries.find((i) => i.id === openInquiryId) || null, [inquiries, openInquiryId]);
  const openStudent = useMemo(() => students.find((s) => s.id === openStudentId) || null, [students, openStudentId]);

  const sectionCounts = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      if (s.section) map[`${s.classApplied}-${s.section}`] = (map[`${s.classApplied}-${s.section}`] || 0) + 1;
    });
    return map;
  }, [students]);

  const searchIndex = useMemo(() => {
    if (!role) return [];
    switch (role.id) {
      case "counselor":
        return inquiries.map((i) => ({ type: "inquiry", id: i.id, raw: i, title: i.student, subtitle: `${i.classApplied} · ${i.parentName}`, typeLabel: "Inquiry" }));
      case "coordinator":
        return students.map((s) => ({ type: "student", id: s.id, raw: s, title: s.name, subtitle: `${s.classApplied}${s.section ? " - " + s.section : ""} · ${s.status}`, typeLabel: "Student" }));
      case "teacher": {
        const rows = [];
        TEACHER_SECTIONS.forEach((sec) => {
          makeRoster(sec).forEach((s) => rows.push({ type: "rosterStudent", id: s.id, raw: s, title: s.name, subtitle: `${sec} · Roll ${s.rollNumber}`, typeLabel: "Student" }));
        });
        return rows;
      }
      case "principal": {
        const rows = [];
        DEFAULTERS.forEach((d) => rows.push({ type: "defaulter", id: d.name, raw: d, title: d.name, subtitle: `${d.cls} · Rs ${d.due.toLocaleString("en-IN")} due`, typeLabel: "Defaulter" }));
        RISK_STUDENTS.forEach((s) => rows.push({ type: "riskStudent", id: s.name, raw: s, title: s.name, subtitle: s.cls, typeLabel: "Risk" }));
        TEACHERS_PERFORMANCE.forEach((t) => rows.push({ type: "teacherPerf", id: t.name, raw: t, title: t.name, subtitle: t.subject, typeLabel: "Teacher" }));
        return rows;
      }
      case "admin":
        return staffList.map((s, idx) => ({ type: "staff", id: idx, raw: s, title: s.name, subtitle: `${s.role} · ${s.subject}`, typeLabel: "Staff" }));
      case "superadmin":
        return schoolsList.map((s) => ({ type: "school", id: s.id, raw: s, title: s.name, subtitle: s.city, typeLabel: "School" }));
      case "parent":
        return CHILDREN.map((c) => ({ type: "child", id: c.id, raw: c, title: c.name, subtitle: `${c.section} · Roll ${c.rollNumber}`, typeLabel: "Child" }));
      case "student":
        return homeworkList.filter((h) => h.section === CHILD.section).map((h) => ({ type: "homework", id: h.id, raw: h, title: h.title, subtitle: `${h.subject} · Due ${h.due}`, typeLabel: "Homework" }));
      default:
        return [];
    }
  }, [role, inquiries, students, staffList, schoolsList, homeworkList]);

  function handleSearchSelect(item) {
    switch (item.type) {
      case "inquiry":
        setOpenInquiryId(item.id);
        break;
      case "student":
        setOpenStudentId(item.id);
        break;
      case "rosterStudent":
        setView("students");
        setOpenTeacherStudent(item.raw);
        break;
      case "defaulter":
        setView("fees");
        break;
      case "riskStudent":
        setView("risk");
        viewRiskTimeline(item.raw);
        break;
      case "teacherPerf":
        setView("teachers");
        break;
      case "staff":
        setView("staff");
        break;
      case "school":
        setOpenSchoolId(item.id);
        break;
      case "child":
        setSelectedChildId(item.id);
        setView("dashboard");
        break;
      case "homework":
        setView("homework");
        break;
      default:
        break;
    }
  }

  const notifications = useMemo(() => {
    if (!role) return [];
    const items = [];
    switch (role.id) {
      case "counselor": {
        const newCount = inquiries.filter((i) => i.stage === "new").length;
        if (newCount > 0) items.push({ icon: ClipboardList, tint: "#4F46E5", title: `${newCount} new inquiries need follow-up`, subtitle: "Admission Funnel", view: "funnel" });
        const testCount = inquiries.filter((i) => i.stage === "test").length;
        if (testCount > 0) items.push({ icon: FileCheck2, tint: "#0EA5A0", title: `${testCount} students awaiting entrance test`, subtitle: "Admission Funnel", view: "funnel" });
        break;
      }
      case "coordinator": {
        const pending = students.filter((s) => s.status === "Recently Enrolled").length;
        if (pending > 0) items.push({ icon: ClipboardCheck, tint: "#D97706", title: `${pending} students awaiting allocation`, subtitle: "Coordinator Dashboard", view: "dashboard" });
        break;
      }
      case "teacher": {
        const pendingLeaves = leaveRequests.filter((l) => l.status === "pending").length;
        if (pendingLeaves > 0) items.push({ icon: CalendarDays, tint: "#DC2626", title: `${pendingLeaves} leave requests pending review`, subtitle: "Leave Requests", view: "leave" });
        const unmarked = TEACHER_SECTIONS.filter((sec) => !attendanceRecords[`${sec}|${todayKey}`]).length;
        if (unmarked > 0) items.push({ icon: ClipboardCheck, tint: "#D97706", title: `Attendance pending for ${unmarked} section${unmarked > 1 ? "s" : ""}`, subtitle: "Attendance", view: "attendance" });
        break;
      }
      case "principal": {
        const pendingTransfers = transferRequests.filter((t) => t.status === "pending").length;
        if (pendingTransfers > 0) items.push({ icon: ArrowRightLeft, tint: "#D97706", title: `${pendingTransfers} pending transfer requests`, subtitle: "Transfer Requests", view: "transfers" });
        items.push({ icon: AlertTriangle, tint: "#DC2626", title: `${DEFAULTERS.length} fee defaulters`, subtitle: `Rs ${DEFAULTERS.reduce((s, d) => s + d.due, 0).toLocaleString("en-IN")} outstanding`, view: "fees" });
        items.push({ icon: TrendingDown, tint: "#DC2626", title: `${RISK_STUDENTS.length} students flagged at risk`, subtitle: "Risk Students", view: "risk" });
        break;
      }
      case "admin": {
        const onLeave = staffList.filter((s) => s.status === "On Leave").length;
        if (onLeave > 0) items.push({ icon: Briefcase, tint: "#D97706", title: `${onLeave} staff member${onLeave > 1 ? "s" : ""} on leave`, subtitle: "Staff Directory", view: "staff" });
        items.push({ icon: Megaphone, tint: "#4F46E5", title: `${schoolNotices.length} notices published`, subtitle: "Notices & Announcements", view: "notices" });
        break;
      }
      case "superadmin": {
        const trials = schoolsList.filter((s) => (schoolPlans[s.id]?.status) === "Trial").length;
        if (trials > 0) items.push({ icon: AlertCircle, tint: "#D97706", title: `${trials} school${trials > 1 ? "s" : ""} on trial plan`, subtitle: "Billing & Plans", view: "billing" });
        const overdueInvoices = invoices.filter((i) => i.status === "overdue").length;
        if (overdueInvoices > 0) items.push({ icon: AlertTriangle, tint: "#DC2626", title: `${overdueInvoices} overdue invoice${overdueInvoices > 1 ? "s" : ""}`, subtitle: "Billing & Invoicing", view: "billing" });
        break;
      }
      case "parent": {
        const feeDue = (feeInstallmentsByChild[selectedChildId] || []).filter((f) => f.status === "due").length;
        if (feeDue > 0) items.push({ icon: IndianRupee, tint: "#DC2626", title: `${feeDue} fee installment${feeDue > 1 ? "s" : ""} due`, subtitle: selectedChild.name, view: "fees" });
        if (schoolNotices.length > 0) items.push({ icon: Bell, tint: "#4F46E5", title: schoolNotices[0].title, subtitle: `School notice · ${schoolNotices[0].date}`, view: "dashboard" });
        const myLeaves = leaveRequests.filter((l) => l.studentName === selectedChild.name && l.status !== "pending");
        if (myLeaves.length > 0) items.push({ icon: CalendarDays, tint: myLeaves[0].status === "approved" ? "#059669" : "#DC2626", title: `Leave request ${myLeaves[0].status}`, subtitle: selectedChild.name, view: "leaveptm" });
        break;
      }
      case "student": {
        const myHomework = homeworkList.filter((h) => h.section === CHILD.section);
        if (myHomework.length > 0) items.push({ icon: BookOpen, tint: "#D97706", title: `${myHomework.length} homework item${myHomework.length > 1 ? "s" : ""} pending`, subtitle: "Homework", view: "homework" });
        items.push({ icon: CalendarDays, tint: "#4F46E5", title: SCHOOL_EVENTS[0].title, subtitle: SCHOOL_EVENTS[0].date, view: "dashboard" });
        break;
      }
      default:
        break;
    }
    return items;
  }, [role, inquiries, students, leaveRequests, attendanceRecords, todayKey, transferRequests, staffList, schoolNotices, schoolsList, feeInstallmentsByChild, selectedChildId, selectedChild, homeworkList, schoolPlans, invoices]);

  function handleNotificationSelect(n) {
    setView(n.view);
  }

  function moveStage(id, stageId, extras = {}) {
    if (stageId === "confirmed") {
      let newlyCreatedId = null;
      const inq = inquiries.find((i) => i.id === id);
      if (!inq) return;
      const photo = extras.photo || inq.photo || null;
      const credentials = inq.credentials || makeCredentials(inq);
      const schoolPrefix = (displaySchool?.logo || "STU").toUpperCase();
      const admissionNo = `${schoolPrefix}-${new Date().getFullYear()}-${String(inq.id).replace(/\D/g, "").slice(-4).padStart(4, "0")}`;
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, stage: stageId, lastActivity: "Just now", photo, credentials } : i)));
      setStudents((prev) => {
        if (prev.some((s) => s.inquiryId === id)) return prev;
        const existingRolls = prev
          .filter((s) => s.classApplied === inq.classApplied && typeof s.rollNumber === "number")
          .map((s) => s.rollNumber);
        const nextRoll = (existingRolls.length ? Math.max(...existingRolls) : 0) + 1;
        const derived = deriveEnrolledStudents([{ ...inq, stage: "confirmed", photo, credentials }]).map((s) => ({ ...s, admissionNo, rollNumber: nextRoll }));
        newlyCreatedId = derived[0]?.id || null;
        return [...prev, ...derived];
      });
      if (newlyCreatedId) {
        setIdCardIsNew(true);
        setIdCardStudentId(newlyCreatedId);
        setOpenInquiryId(null);
      }
      return;
    }
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, stage: stageId, lastActivity: "Just now" } : i)));
  }

  function createInquiry(form) {
    const newInq = {
      id: `INQ-${2000 + Math.floor(Math.random() * 9000)}`,
      student: form.student,
      parentName: form.parentName || `${form.student.split(" ")[0]} Family`,
      phone: form.phone || "+91 90000 00000",
      email: form.email || "parent@example.com",
      classApplied: form.classApplied,
      stage: "new",
      counselor: "Priya Sharma",
      source: form.source,
      createdDaysAgo: 0,
      lastActivity: "Just now",
      notes: [],
    };
    setInquiries((prev) => [newInq, ...prev]);
    setShowNewInquiry(false);
    setOpenInquiryId(newInq.id);
  }

  function submitPublicEnquiry(form) {
    const newInq = {
      id: `INQ-${2000 + Math.floor(Math.random() * 9000)}`,
      student: form.student,
      parentName: form.parentName,
      phone: form.phone,
      email: form.email || "parent@example.com",
      classApplied: form.classApplied,
      stage: "new",
      counselor: COUNSELORS[Math.floor(Math.random() * COUNSELORS.length)],
      source: "Website",
      createdDaysAgo: 0,
      lastActivity: "Just now",
      notes: [
        {
          date: "Today",
          text: `Submitted online via the public enquiry form for ${enquirySchool?.name || "the school"}.${form.visitDate ? ` Preferred visit date: ${form.visitDate}.` : ""}${form.message ? ` Message: "${form.message}"` : ""}`,
        },
      ],
    };
    setInquiries((prev) => [newInq, ...prev]);
    setLastEnquiryRef(newInq.id);
    setPublicStage("confirmation");
  }

  function saveAllocation(studentId, form) {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, ...form, status: "Section Allocated" } : s)));
    setOpenStudentId(null);
  }

  function saveAttendance(section, dateKey, marks) {
    setAttendanceRecords((prev) => ({ ...prev, [`${section}|${dateKey}`]: marks }));
  }

  function postHomework(form) {
    setHomeworkList((prev) => [
      { id: `HW-${Math.floor(1000 + Math.random() * 9000)}`, section: form.section, subject: form.subject, title: form.title, due: form.due, postedDaysAgo: 0, attachment: form.attachment || null },
      ...prev,
    ]);
  }

  function saveMarks(key, marksMap) {
    setExamMarks((prev) => ({ ...prev, [key]: marksMap }));
  }

  function respondLeave(id, status) {
    setLeaveRequests((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  function addBehaviourNote(studentId, note) {
    setBehaviourNotes((prev) => ({ ...prev, [studentId]: [note, ...(prev[studentId] || [])] }));
  }

  function payFee(childId, id) {
    setFeeInstallmentsByChild((prev) => ({
      ...prev,
      [childId]: prev[childId].map((f) => (f.id === id ? { ...f, status: "paid" } : f)),
    }));
  }

  function sendMessage(text, from = "parent") {
    setMessages((prev) => [...prev, { from, text }]);
  }

  function applyLeave(childId, form) {
    const forChild = CHILDREN.find((c) => c.id === childId) || CHILD;
    setLeaveRequests((prev) => [
      { id: `LR-${Math.floor(1000 + Math.random() * 9000)}`, studentName: forChild.name, section: forChild.section, reason: form.reason, fromDate: form.fromDate || "TBD", toDate: form.toDate || "TBD", status: "pending" },
      ...prev,
    ]);
  }

  function bookPtm(childId, slot) {
    setPtmBookedByChild((prev) => ({ ...prev, [childId]: slot }));
  }

  function respondTransfer(name, status) {
    setTransferRequests((prev) => prev.map((r) => (r.name === name ? { ...r, status } : r)));
  }

  function createSchool(form) {
    const id = `sch-${Math.floor(1000 + Math.random() * 9000)}`;
    const colors = [
      { color: "#7C3AED", colorSoft: "#F5F3FF" }, { color: "#DB2777", colorSoft: "#FDF2F8" },
      { color: "#0891B2", colorSoft: "#ECFEFF" }, { color: "#65A30D", colorSoft: "#F7FEE7" },
    ];
    const c = colors[Math.floor(Math.random() * colors.length)];
    const newSchool = {
      id, name: form.name, city: form.city || "Uttar Pradesh", principal: form.principal || "TBD",
      color: c.color, colorSoft: c.colorSoft, students: 0, logo: form.name.slice(0, 2).toUpperCase(),
      agreementStatus: "pending",
      logoUrl: form.logoUrl || null, bannerUrl: form.bannerUrl || null,
    };
    setSchoolsList((prev) => [...prev, newSchool]);
    setSchoolPlans((prev) => ({ ...prev, [id]: { plan: "Starter", mrr: 8000, status: "Trial", renewal: "In 14 days" } }));
    setShowAddSchool(false);
  }

  function activateSchool(id) {
    setSchoolsList((prev) => prev.map((s) => (s.id === id ? { ...s, agreementStatus: "active" } : s)));
  }

  function generateInvoice(schoolId) {
    const plan = schoolPlans[schoolId] || { mrr: 8000 };
    const issue = new Date();
    const due = new Date();
    due.setDate(due.getDate() + 30);
    const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    setInvoices((prev) => [
      { id: `INV-${1000 + prev.length + 1}`, schoolId, amount: plan.mrr, issueDate: fmt(issue), dueDate: fmt(due), status: "sent" },
      ...prev,
    ]);
  }

  function markInvoicePaid(invoiceId) {
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "paid" } : inv)));
  }

  function updateSchoolBranding(id, patch) {
    setSchoolsList((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addStaff(form) {
    setStaffList((prev) => [...prev, { ...form, status: "Active" }]);
  }

  function updateFeeHead(id, amount) {
    setFeeHeads((prev) => prev.map((f) => (f.id === id ? { ...f, amount } : f)));
  }

  function addTransportRoute(form) {
    setTransportRoutes((prev) => [
      ...prev,
      { id: `RT${prev.length + 1}`, name: form.name, busNumber: form.busNumber, driver: form.driver || "TBD", capacity: form.capacity, assigned: 0, stops: form.stops },
    ]);
  }

  function addHostelBlock(form) {
    setHostelBlocks((prev) => [
      ...prev,
      { id: `HB${prev.length + 1}`, name: form.name, warden: form.warden, totalRooms: form.totalRooms, capacityPerRoom: form.capacityPerRoom, occupiedRooms: 0 },
    ]);
  }

  function postNotice(title) {
    setSchoolNotices((prev) => [{ title, date: "Just now" }, ...prev]);
  }

  function viewCoordinatorTimeline(student) {
    const t = buildCoordinatorStudentTimeline(student, inquiries);
    setTimelineDrawer({ name: student.name, ...t });
  }

  function viewRosterTimeline(rosterStudent) {
    const t = buildRosterTimeline(rosterStudent, behaviourNotes);
    setTimelineDrawer({ name: rosterStudent.name, ...t });
  }

  function viewRiskTimeline(riskStudent) {
    const t = buildRiskStudentTimeline(riskStudent);
    setTimelineDrawer({ name: riskStudent.name, ...t });
  }

  function handleNavigate(v) {
    if (v === "newInquiry") { setShowNewInquiry(true); return; }
    setView(v);
  }

  function handleLogin(r) {
    setRole(r);
    setView("dashboard");
  }

  function goHome() {
    setEntryMode("landing");
    setSchool(null);
    setPublicStage("browse");
    setEnquirySchool(null);
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!role) {
    if (entryMode === "landing") {
      return (
        <LandingScreen
          onFind={() => { setPublicStage("browse"); setEntryMode("find"); }}
          onFamily={() => setEntryMode("familyLogin")}
          onStaff={() => setEntryMode("staffLogin")}
          onSuperAdmin={() => setEntryMode("superAdminLogin")}
        />
      );
    }

    if (entryMode === "superAdminLogin") {
      return <SuperAdminLoginScreen onBack={goHome} onLogin={() => handleLogin(SUPERADMIN_ROLE)} />;
    }

    if (entryMode === "familyLogin" || entryMode === "staffLogin") {
      if (!school) {
        return (
          <SchoolPickerScreen
            schools={activeSchools}
            title={entryMode === "familyLogin" ? "Family Sign In" : "School Staff Sign In"}
            subtitle="Choose your school to continue"
            onPick={(s) => setSchool(s)}
            onBack={goHome}
          />
        );
      }
      return (
        <RoleLogin
          school={school}
          roles={entryMode === "familyLogin" ? FAMILY_ROLES : STAFF_ROLES}
          onBack={() => setSchool(null)}
          onLogin={handleLogin}
        />
      );
    }

    // entryMode === "find": public Discover & Enquire flow, Active schools only
    if (publicStage === "profile" && enquirySchool) {
      return (
        <SchoolProfileScreen
          school={enquirySchool}
          onBack={() => { setPublicStage("browse"); setEnquirySchool(null); }}
          onEnquire={() => setPublicStage("enquire")}
          onGoToSignIn={goHome}
        />
      );
    }
    if (publicStage === "enquire" && enquirySchool) {
      return (
        <EnquiryFormScreen
          school={enquirySchool}
          onBack={() => setPublicStage("profile")}
          onSubmit={submitPublicEnquiry}
        />
      );
    }
    if (publicStage === "confirmation" && enquirySchool) {
      return (
        <EnquiryConfirmationScreen
          school={enquirySchool}
          referenceId={lastEnquiryRef}
          onTrack={() => setPublicStage("track")}
          onBrowse={() => { setPublicStage("browse"); setEnquirySchool(null); }}
        />
      );
    }
    if (publicStage === "track") {
      return <TrackInquiryScreen inquiries={inquiries} onBack={() => setPublicStage("browse")} />;
    }
    return (
      <BrowseSchoolsScreen
        schools={activeSchools}
        onViewProfile={(s) => { setEnquirySchool(s); setPublicStage("profile"); }}
        onTrack={() => setPublicStage("track")}
        onBackHome={goHome}
      />
    );
  }

  const navItems = NAV_CONFIG[role.id] || [{ id: "dashboard", label: "Dashboard", icon: LayoutGrid }];
  const personName = PERSON_NAMES[role.id] || role.label;

  return (
    <AppShell
      school={displaySchool || PLATFORM_BRAND}
      role={role}
      active={view}
      navItems={navItems}
      personName={personName}
      onNavigate={handleNavigate}
      onLogout={() => { supabase.auth.signOut(); setRole(null); setView("dashboard"); goHome(); }}
      darkMode={darkMode}
      onToggleDark={() => setDarkMode((v) => !v)}
      searchIndex={searchIndex}
      onSelectSearchResult={handleSearchSelect}
      searchPlaceholder={SEARCH_PLACEHOLDERS[role.id]}
      notifications={notifications}
      onSelectNotification={handleNotificationSelect}
    >
      {role.id === "counselor" && view === "dashboard" && (
        <CounselorDashboard
          inquiries={inquiries}
          onOpenInquiry={(i) => setOpenInquiryId(i.id)}
          onNavigate={handleNavigate}
          school={displaySchool}
        />
      )}
      {role.id === "counselor" && view === "funnel" && (
        <FunnelBoard
          inquiries={inquiries}
          onOpenInquiry={(i) => setOpenInquiryId(i.id)}
          onMoveStage={moveStage}
          onNavigate={handleNavigate}
        />
      )}
      {role.id === "counselor" && view === "inquiries" && (
        <InquiriesTable
          inquiries={inquiries}
          onOpenInquiry={(i) => setOpenInquiryId(i.id)}
          onNavigate={handleNavigate}
        />
      )}
      {role.id === "counselor" && view === "calendar" && (
        <div className="max-w-2xl">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px]">Calls, campus visits, and entrance tests will appear here — coming in a future build pass.</p>
        </div>
      )}

      {role.id === "coordinator" && view === "dashboard" && (
        <CoordinatorDashboard
          students={students}
          onOpenStudent={(s) => setOpenStudentId(s.id)}
          onShowIdCard={(s) => { setIdCardIsNew(false); setIdCardStudentId(s.id); }}
          school={displaySchool}
        />
      )}
      {role.id === "coordinator" && view === "capacity" && (
        <SectionCapacityScreen students={students} />
      )}

      {role.id === "teacher" && view === "dashboard" && (
        <TeacherDashboard
          homeworkList={homeworkList}
          leaveRequests={leaveRequests}
          attendanceRecords={attendanceRecords}
          todayKey={todayKey}
          onNavigate={handleNavigate}
          onOpenSection={(sec) => { setAttendanceSection(sec); setView("attendance"); }}
        />
      )}
      {role.id === "teacher" && view === "attendance" && (
        <AttendanceScreen
          initialSection={attendanceSection}
          attendanceRecords={attendanceRecords}
          todayKey={todayKey}
          onSave={saveAttendance}
        />
      )}
      {role.id === "teacher" && view === "homework" && (
        <HomeworkScreen homeworkList={homeworkList} onPost={postHomework} />
      )}
      {role.id === "teacher" && view === "gradebook" && (
        <TeacherGradebookScreen examMarks={examMarks} onSaveMarks={saveMarks} />
      )}
      {role.id === "teacher" && view === "students" && (
        <TeacherStudentList onOpenStudent={setOpenTeacherStudent} />
      )}
      {role.id === "teacher" && view === "messages" && (
        <TeacherMessagesScreen liveMessages={messages} onSendLive={(text) => sendMessage(text, "teacher")} />
      )}
      {role.id === "teacher" && view === "leave" && (
        <LeaveRequestsScreen leaveRequests={leaveRequests} onRespond={respondLeave} />
      )}

      {role.id === "student" && view === "dashboard" && (
        <StudentDashboard homeworkList={homeworkList} onNavigate={handleNavigate} feeInstallments={feeInstallmentsByChild[CHILD.id]} onShowIdCard={() => setIdCardOverride(childToIdCardStudent(CHILD))} />
      )}
      {role.id === "student" && view === "homework" && (
        <StudentHomeworkScreen homeworkList={homeworkList} />
      )}
      {role.id === "student" && view === "results" && <StudentResultsScreen examMarks={examMarks} child={CHILD} />}
      {role.id === "student" && view === "fees" && (
        <FeesScreen installments={feeInstallmentsByChild[CHILD.id]} onPay={() => {}} canPay={false} child={CHILD} />
      )}
      {role.id === "student" && view === "campus" && <CampusLifeScreen />}
      {role.id === "student" && view === "timeline" && (
        <TimelineScreen
          name={CHILD.name}
          subtitle={`${CHILD.section} · Roll No. ${CHILD.rollNumber} · Admission No. ${CHILD.admissionNo}`}
          status="Active Student"
          milestones={AARAV_MILESTONES}
          activity={buildChildActivity(CHILD, behaviourNotes, feeInstallmentsByChild[CHILD.id], leaveRequests, ptmBookedByChild[CHILD.id])}
        />
      )}

      {role.id === "parent" && view === "dashboard" && (
        <ParentDashboard
          child={selectedChild}
          children={CHILDREN}
          onSwitchChild={setSelectedChildId}
          homeworkList={homeworkList}
          feeInstallments={feeInstallmentsByChild[selectedChild.id]}
          onNavigate={handleNavigate}
          notices={schoolNotices}
          onShowIdCard={(c) => setIdCardOverride(childToIdCardStudent(c))}
        />
      )}
      {role.id === "parent" && view === "fees" && (
        <FeesScreen installments={feeInstallmentsByChild[selectedChild.id]} onPay={(id) => payFee(selectedChild.id, id)} canPay={true} child={selectedChild} />
      )}
      {role.id === "parent" && view === "messages" && (
        <ParentMessagesScreen messages={messages} onSend={sendMessage} />
      )}
      {role.id === "parent" && view === "leaveptm" && (
        <ParentLeavePTMScreen
          child={selectedChild}
          onApplyLeave={(form) => applyLeave(selectedChild.id, form)}
          onBookPtm={(slot) => bookPtm(selectedChild.id, slot)}
          ptmBooked={ptmBookedByChild[selectedChild.id]}
        />
      )}
      {role.id === "parent" && view === "timeline" && (
        <TimelineScreen
          name={selectedChild.name}
          subtitle={`${selectedChild.section} · Roll No. ${selectedChild.rollNumber} · Admission No. ${selectedChild.admissionNo}`}
          status="Active Student"
          milestones={CHILD_MILESTONES[selectedChild.id]}
          activity={buildChildActivity(selectedChild, behaviourNotes, feeInstallmentsByChild[selectedChild.id], leaveRequests, ptmBookedByChild[selectedChild.id])}
        />
      )}

      {role.id === "principal" && view === "dashboard" && (
        <PrincipalDashboard inquiries={inquiries} students={students} school={displaySchool} onNavigate={handleNavigate} />
      )}
      {role.id === "principal" && view === "fees" && <FeeCollectionScreen />}
      {role.id === "principal" && view === "strength" && <StudentStrengthScreen />}
      {role.id === "principal" && view === "teachers" && <TeacherPerformanceScreen />}
      {role.id === "principal" && view === "risk" && <RiskStudentsScreen onOpenTimeline={viewRiskTimeline} />}
      {role.id === "principal" && view === "transfers" && (
        <TransferRequestsScreen requests={transferRequests} onRespond={respondTransfer} />
      )}

      {role.id === "superadmin" && view === "dashboard" && (
        <SuperAdminDashboard
          schools={schoolsList}
          schoolPlans={schoolPlans}
          onOpenSchool={(s) => setOpenSchoolId(s.id)}
          onAddSchool={() => setShowAddSchool(true)}
          onActivateSchool={activateSchool}
        />
      )}
      {role.id === "superadmin" && view === "billing" && (
        <BillingScreen
          schools={schoolsList}
          schoolPlans={schoolPlans}
          invoices={invoices}
          onGenerateInvoice={generateInvoice}
          onMarkInvoicePaid={markInvoicePaid}
        />
      )}

      {role.id === "admin" && view === "dashboard" && (
        <SchoolAdminDashboard school={displaySchool} staff={staffList} notices={schoolNotices} onNavigate={handleNavigate} sections={liveSections} />
      )}
      {role.id === "admin" && view === "staff" && (
        <StaffDirectoryScreen staff={staffList} onAddStaff={addStaff} />
      )}
      {role.id === "admin" && view === "classes" && <ClassSectionManagerScreen sections={liveSections} />}
      {role.id === "admin" && view === "transport" && (
        <TransportScreen routes={transportRoutes} onAddRoute={addTransportRoute} />
      )}
      {role.id === "admin" && view === "hostel" && (
        <HostelScreen blocks={hostelBlocks} onAddBlock={addHostelBlock} />
      )}
      {role.id === "admin" && view === "fees" && (
        <FeeStructureScreen feeHeads={feeHeads} onUpdate={updateFeeHead} />
      )}
      {role.id === "admin" && view === "notices" && (
        <NoticesComposerScreen notices={schoolNotices} onPost={postNotice} />
      )}
      {role.id === "admin" && view === "settings" && <SchoolSettingsScreen school={displaySchool} onUpdateBranding={updateSchoolBranding} />}

      {!["counselor", "coordinator", "teacher", "student", "parent", "principal", "admin", "superadmin"].includes(role.id) && (
        <div className="max-w-lg py-10">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
            {React.createElement(ROLE_ICONS[role.id] || LayoutGrid, { size: 22 })}
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{role.label} dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[13.5px]">
            This journey is next in the build queue. The Counselor and Coordinator journeys are fully interactive today &mdash;
            sign out and try those, or let me know to prioritize {role.label} next.
          </p>
        </div>
      )}

      {openInquiry && (
        <InquiryDrawer inquiry={openInquiry} onClose={() => setOpenInquiryId(null)} onMoveStage={moveStage} />
      )}
      {showNewInquiry && (
        <NewInquiryModal onClose={() => setShowNewInquiry(false)} onCreate={createInquiry} />
      )}
      {openStudent && (
        <AllocationDrawer
          student={openStudent}
          onClose={() => setOpenStudentId(null)}
          onSave={saveAllocation}
          sectionCounts={sectionCounts}
          onViewTimeline={viewCoordinatorTimeline}
          onShowIdCard={(s) => { setIdCardIsNew(false); setIdCardStudentId(s.id); }}
        />
      )}
      {openTeacherStudent && (
        <TeacherStudentDrawer
          student={openTeacherStudent}
          notes={behaviourNotes}
          onClose={() => setOpenTeacherStudent(null)}
          onAddNote={addBehaviourNote}
          onViewTimeline={viewRosterTimeline}
          onShowIdCard={(s) => { setIdCardIsNew(false); setIdCardOverride(childToIdCardStudent(s, s.parentName || "Parent / Guardian", s.phone || "+91 90000 00000")); }}
        />
      )}
      {openSuperAdminSchool && (
        <SchoolDetailDrawer
          school={openSuperAdminSchool}
          plan={schoolPlans[openSuperAdminSchool.id] || { plan: "Starter", mrr: 8000, status: "Trial", renewal: "TBD" }}
          invoices={invoices}
          onClose={() => setOpenSchoolId(null)}
          onActivateSchool={activateSchool}
          onUpdateBranding={updateSchoolBranding}
          onGenerateInvoice={generateInvoice}
          onMarkInvoicePaid={markInvoicePaid}
        />
      )}
      {showAddSchool && (
        <AddSchoolModal onClose={() => setShowAddSchool(false)} onCreate={createSchool} />
      )}
      {timelineDrawer && (
        <TimelineDrawer {...timelineDrawer} onClose={() => setTimelineDrawer(null)} />
      )}
      {idCardStudent && (
        <IDCardModal
          student={idCardStudent}
          school={displaySchool || schoolsList.find((x) => x.id === "gvs") || schoolsList[0]}
          isNew={idCardIsNew}
          onClose={() => { setIdCardStudentId(null); setIdCardIsNew(false); setIdCardOverride(null); }}
        />
      )}
    </AppShell>
  );
}
