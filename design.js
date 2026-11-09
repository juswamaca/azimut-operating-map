/* The team's target design: outcome teams and their stages, the 15 Azi-bots and the ten target workflows.
 * These are not in the master sheet. Change them here only if the target design changes.
 * Workflows are matched to stages by Workflow ID, or by name when a workflow has no ID.
 */
window.DESIGN = {
 "version": "9 Nov 2026",
 "functions": [
  "Wealth Management",
  "Fund Management",
  "Finance & Operations",
  "Compliance",
  "Technology & Cybersecurity",
  "People & HR",
  "Marketing",
  "Management"
 ],
 "fnMap": {
  "Wealth Management": "Wealth Management",
  "Fund Management": "Fund Management",
  "Operations_Finance": "Finance & Operations",
  "Operations_Compliance": "Compliance"
 },
 "proposedFamilies": [
  [
   "Wealth Management",
   "Client Advisory",
   "Client Advisory & Reviews"
  ],
  [
   "Wealth Management",
   "Portfolio Review",
   "Client Advisory & Reviews"
  ],
  [
   "Fund Management",
   "Portfolio Management",
   "Investment Management"
  ],
  [
   "Fund Management",
   "Fund Operations",
   "Investment Management"
  ],
  [
   "Finance & Operations",
   "Payroll",
   "Payroll"
  ],
  [
   "Finance & Operations",
   "MAS Quarterly & Annual Reporting",
   "Regulatory & Audit"
  ],
  [
   "Finance & Operations",
   "External Audit",
   "Regulatory & Audit"
  ],
  [
   "Compliance",
   "Client Document Review",
   "Client Monitoring"
  ],
  [
   "Compliance",
   "Client Periodic Review",
   "Client Monitoring"
  ],
  [
   "Compliance",
   "Client Data Record",
   "Client Monitoring"
  ],
  [
   "Compliance",
   "Business Partners Periodic Review",
   "Business Partners"
  ],
  [
   "Compliance",
   "Trade Monitoring",
   "Surveillance"
  ],
  [
   "Compliance",
   "Staff Onboarding",
   "Staff & Audit"
  ],
  [
   "Compliance",
   "Internal Audit",
   "Staff & Audit"
  ]
 ],
 "later": [
  [
   "Compliance",
   "Client Monitoring",
   "Annual Client Name Screening",
   "WF-CMON-004"
  ],
  [
   "Compliance",
   "Surveillance",
   "Advisory Post-Trade Check",
   "WF-SURV-003"
  ],
  [
   "Compliance",
   "Surveillance",
   "Suspicious Transaction Reporting",
   "WF-SURV-002"
  ],
  [
   "Compliance",
   "Business Partners",
   "Business Partner Onboarding",
   "WF-BP-001"
  ],
  [
   "Compliance",
   "Staff & Audit",
   "Staff Personal Trade Pre-clearance",
   "WF-STAFF-005"
  ],
  [
   "Compliance",
   "Regulatory",
   "Marketing Material Review",
   ""
  ],
  [
   "Compliance",
   "Regulatory",
   "New Product Approval",
   ""
  ],
  [
   "Compliance",
   "Regulatory",
   "External Audit Support",
   ""
  ],
  [
   "Compliance",
   "Regulatory",
   "MAS Notifications and Submissions",
   ""
  ]
 ],
 "targetById": {
  "WF-CA-001": "proposal",
  "WF-PR-001": "review",
  "WF-ONB-001": "onboarding",
  "WF-TRADE-003": "pretrade",
  "WF-RETRO-001": "revenue",
  "WF-RETRO-002": "revenue",
  "WF-FEES-002": "revenue",
  "WF-COMM-001": "commission",
  "WF-COMM-002": "commission",
  "WF-ONB-002": "feeletter",
  "WF-PEC-001": "close",
  "WF-AUM-001": "aum",
  "WF-MR-002": "aum"
 },
 "targetByName": {
  "Trade Monitoring": "pretrade"
 },
 "nameFixes": [
  [
   "Trade Monitoring (Guardian)",
   "Trade Monitoring"
  ]
 ],
 "extraWorkflows": [
  {
   "key": "wealth-management--market-monitoring",
   "function": "Wealth Management",
   "family": "Client Advisory & Reviews",
   "familyProposed": true,
   "name": "Market Monitoring & Outreach",
   "id": "",
   "contribs": [],
   "later": false,
   "e2e": [],
   "target": "market",
   "targetOnly": true
  }
 ],
 "teamByFunction": {
  "Wealth Management": "advise",
  "Fund Management": "advise",
  "Finance & Operations": "revenue",
  "Compliance": "protect"
 },
 "alias": {
  "Outsourced accounting service provider": "Outsourced accountant",
  "Outsourced accounting vendor": "Outsourced accountant"
 },
 "knownParties": [
  "RM",
  "ARM",
  "Finance",
  "Compliance",
  "Legal",
  "Bank",
  "Client",
  "Counterparty",
  "MD",
  "Outsourced accountant",
  "Capital Introducer"
 ],
 "targets": {
  "market": {
   "title": "Market monitoring and client outreach",
   "agents": [
    "Market Trend"
   ],
   "wave": 1,
   "owner": "RM",
   "trigger": "Every morning, and any large market move",
   "change": "A ranked call list is ready every morning, whether or not an ARM has spare time",
   "today": "Research happens only when an ARM has spare time between ops tasks; RMs with a Central ARM mostly do it alone.",
   "steps": [
    {
     "who": "Market Trend",
     "kind": "agent",
     "text": "Scans overnight market news and price moves"
    },
    {
     "who": "Market Trend",
     "kind": "agent",
     "text": "Maps each move to the clients who hold the exposure"
    },
    {
     "who": "Market Trend",
     "kind": "agent",
     "text": "Ranks clients by impact, drafts talking points, sends the brief to the RM"
    },
    {
     "who": "RM",
     "kind": "decision",
     "text": "Decides who to call and what to say"
    },
    {
     "who": "RM",
     "kind": "person",
     "text": "Calls or messages the client"
    },
    {
     "who": "Market Trend",
     "kind": "agent",
     "text": "Logs the contact in the CRM; opens a review or proposal if the RM asks"
    }
   ],
   "away": "Client research that depends on an ARM's spare time",
   "measure": "Time from market move to client call",
   "lead": "RM",
   "rep": [],
   "todayAlt": [
    {
     "who": "ARM",
     "text": "Researches market moves, when ops work allows",
     "next": "RM"
    },
    {
     "who": "RM",
     "text": "Decides who to call; RMs with a Central ARM mostly research alone",
     "next": ""
    },
    {
     "who": "RM",
     "text": "Calls or messages the client",
     "next": "Client"
    },
    {
     "who": "RM",
     "text": "Logs the call in the CRM by hand",
     "next": ""
    }
   ]
  },
  "review": {
   "title": "Periodic portfolio review",
   "agents": [
    "Portfolio Review"
   ],
   "wave": 1,
   "owner": "RM",
   "trigger": "A review falls due (quarterly or annual), or Market Trend flags a material change",
   "change": "The pack is drafted from bank data before the meeting, whichever ARM the RM has",
   "today": "The RM pulls statements by hand from several bank platforms; prep quality depends on whether the RM has a Dedicated ARM.",
   "steps": [
    {
     "who": "Portfolio Review",
     "kind": "agent",
     "text": "Pulls the client's holdings and performance from the shared record"
    },
    {
     "who": "Portfolio Review",
     "kind": "agent",
     "text": "Flags changes against the mandate, risk profile and last review"
    },
    {
     "who": "Portfolio Review",
     "kind": "agent",
     "text": "Drafts the review pack and suggested next actions"
    },
    {
     "who": "RM",
     "kind": "decision",
     "text": "Edits and approves the pack"
    },
    {
     "who": "RM",
     "kind": "person",
     "text": "Meets the client"
    },
    {
     "who": "Portfolio Review",
     "kind": "agent",
     "text": "Drafts the follow-up email from the RM's notes"
    },
    {
     "who": "RM",
     "kind": "decision",
     "text": "Approves and sends it, by email or WhatsApp"
    },
    {
     "who": "Portfolio Review",
     "kind": "agent",
     "text": "Routes next actions to a proposal or a trade request; updates the CRM"
    }
   ],
   "away": "Pulling statements from each bank platform; uneven preparation between ARM pairings",
   "measure": "Prep time per review",
   "lead": "RM",
   "rep": [],
   "todayAlt": [
    {
     "who": "RM",
     "text": "Pulls statements by hand from each bank platform",
     "next": ""
    },
    {
     "who": "ARM",
     "text": "Prepares the review pack, if the RM has a Dedicated ARM",
     "next": "RM"
    },
    {
     "who": "RM",
     "text": "Checks the pack and prepares for the meeting",
     "next": ""
    },
    {
     "who": "Client",
     "text": "Meets the RM for the review",
     "next": ""
    },
    {
     "who": "RM",
     "text": "Writes the follow-up and updates the CRM by hand",
     "next": ""
    }
   ]
  },
  "proposal": {
   "title": "Portfolio proposal",
   "agents": [
    "Portfolio Proposal"
   ],
   "wave": 2,
   "owner": "RM",
   "trigger": "On demand: new money, a review outcome, or a Market Trend idea",
   "change": "The RM starts from a drafted allocation and deck, not a blank page",
   "today": "The RM gathers the client's profile, objectives and constraints, then pulls product factsheets from PDFs and spreadsheets.",
   "steps": [
    {
     "who": "RM",
     "kind": "person",
     "text": "Picks the client and adds their own insights"
    },
    {
     "who": "Portfolio Proposal",
     "kind": "agent",
     "text": "Loads the client's profile, objectives and constraints"
    },
    {
     "who": "Portfolio Proposal",
     "kind": "agent",
     "text": "Proposes products and an allocation from the approved product list, with the rationale"
    },
    {
     "who": "RM",
     "kind": "decision",
     "text": "Approves or changes the portfolio"
    },
    {
     "who": "Portfolio Proposal",
     "kind": "agent",
     "text": "Builds the client deck and drafts the email"
    },
    {
     "who": "RM",
     "kind": "decision",
     "text": "Approves the deck and sends it, by email or WhatsApp"
    },
    {
     "who": "Client",
     "kind": "person",
     "text": "Agrees the proposal"
    },
    {
     "who": "Portfolio Proposal",
     "kind": "agent",
     "text": "Updates the CRM; an accepted proposal becomes a pre-trade request"
    }
   ],
   "away": "Gathering product material by hand from PDFs and spreadsheets",
   "measure": "Prep time per proposal (baseline to confirm)",
   "lead": "RM",
   "rep": [],
   "todayAlt": [
    {
     "who": "RM",
     "text": "Gathers the client's profile, objectives and constraints",
     "next": ""
    },
    {
     "who": "RM",
     "text": "Pulls product factsheets from PDFs and spreadsheets",
     "next": ""
    },
    {
     "who": "RM",
     "text": "Builds the allocation and the deck by hand",
     "next": "Client"
    },
    {
     "who": "Client",
     "text": "Agrees the proposal",
     "next": ""
    },
    {
     "who": "RM",
     "text": "Updates the CRM; asks the ARM to place the trade",
     "next": "ARM"
    },
    {
     "who": "ARM",
     "text": "Emails Compliance for pre-trade approval",
     "next": "Compliance"
    }
   ]
  },
  "onboarding": {
   "title": "Client onboarding and account opening",
   "agents": [
    "Source-of-Wealth check",
    "Onboarding Tracker"
   ],
   "wave": 1,
   "owner": "ARM runs it; Compliance decides",
   "trigger": "The RM wins a new client",
   "change": "One case everyone can see; documents are chased and pre-checked before Compliance opens it",
   "today": "Documents and questions move by email between the RM, ARM, Compliance, the client and the bank; the RM cannot see where it stands.",
   "steps": [
    {
     "who": "RM",
     "kind": "person",
     "text": "Logs the new client in the CRM"
    },
    {
     "who": "Onboarding Tracker",
     "kind": "agent",
     "text": "Opens one shared case and drafts the document request"
    },
    {
     "who": "ARM",
     "kind": "person",
     "text": "Sends requests and chasers to the client"
    },
    {
     "who": "Client",
     "kind": "person",
     "text": "Sends the documents"
    },
    {
     "who": "Source-of-Wealth check",
     "kind": "agent",
     "text": "Drafts the pre-check memo, gaps flagged"
    },
    {
     "who": "Compliance",
     "kind": "person",
     "text": "Runs Factiva name and adverse media screening"
    },
    {
     "who": "Compliance",
     "kind": "decision",
     "text": "Approves, asks for more or declines; sets the risk rating"
    },
    {
     "who": "Onboarding Tracker",
     "kind": "agent",
     "text": "Pre-fills the bank's account-opening forms"
    },
    {
     "who": "ARM",
     "kind": "person",
     "text": "Submits the forms to the bank"
    },
    {
     "who": "Bank",
     "kind": "person",
     "text": "Runs its own KYC and opens the account"
    },
    {
     "who": "Onboarding Tracker",
     "kind": "agent",
     "text": "Writes the client once to the shared record: CRM, fee schedule, trade record"
    }
   ],
   "away": "Status chasing by email; the same client record set up by hand in several places",
   "measure": "Days from first document request to account open",
   "lead": "ARM",
   "rep": [
    "WF-ONB-001"
   ],
   "todayAlt": null
  },
  "pretrade": {
   "title": "Pre-trade approval and trade monitoring",
   "agents": [
    "Pre-trade Check",
    "Trade Alert Triage"
   ],
   "wave": 3,
   "owner": "Compliance",
   "trigger": "Every trade needs Compliance approval; the trade monitoring system raises alerts after trades",
   "change": "Requests and alerts reach Compliance already checked against the lists and the client",
   "today": "Requests arrive by email in free format, approval takes about an hour, and some arrive after the trade.",
   "steps": [
    {
     "who": "RM or ARM",
     "kind": "person",
     "text": "Submits a short structured request: client, instrument, size, proposal"
    },
    {
     "who": "Pre-trade Check",
     "kind": "agent",
     "text": "Checks the white list, black list, sanctions list and risk profile; drafts a note"
    },
    {
     "who": "Compliance",
     "kind": "decision",
     "text": "Approves or refers the trade"
    },
    {
     "who": "Pre-trade Check",
     "kind": "agent",
     "text": "Records the approval and expected fee in the trade record"
    },
    {
     "who": "ARM",
     "kind": "person",
     "text": "Instructs the bank from a standard template"
    },
    {
     "who": "Bank",
     "kind": "person",
     "text": "Executes the trade"
    },
    {
     "who": "Trade Alert Triage",
     "kind": "agent",
     "text": "For any trade alert, pulls the context and drafts a disposition"
    },
    {
     "who": "Compliance",
     "kind": "decision",
     "text": "Closes the alert; the decision is logged"
    }
   ],
   "away": "Free-format approval emails; alert reviews that start from a blank page",
   "measure": "Approval turnaround; requests made after the trade",
   "lead": "Compliance",
   "rep": [
    "WF-TRADE-003"
   ],
   "todayAlt": null
  },
  "revenue": {
   "title": "Retrocession, third-party and referral revenue validation",
   "agents": [
    "Revenue Assurance"
   ],
   "wave": 2,
   "owner": "Finance",
   "trigger": "Quarterly, as bank and partner reports arrive",
   "change": "ARMs check only the breaks, not every line of every bank report",
   "today": "Finance maps and splits each bank report by hand and emails it out; ARMs check every line against the blotter and reply in free format.",
   "steps": [
    {
     "who": "Bank",
     "kind": "person",
     "text": "Sends the quarterly report, Excel or PDF"
    },
    {
     "who": "Revenue Assurance",
     "kind": "agent",
     "text": "Reads every report into one format; maps lines to RMs"
    },
    {
     "who": "Revenue Assurance",
     "kind": "agent",
     "text": "Matches reported against expected fees; flags breaks"
    },
    {
     "who": "Revenue Assurance",
     "kind": "agent",
     "text": "Sends each ARM a form for their RMs only, breaks first"
    },
    {
     "who": "ARM",
     "kind": "person",
     "text": "Works the breaks with the bank; checks with each RM"
    },
    {
     "who": "RM",
     "kind": "decision",
     "text": "Confirms their figures in the form"
    },
    {
     "who": "Finance",
     "kind": "decision",
     "text": "Approves the allocation per RM per bank"
    },
    {
     "who": "Revenue Assurance",
     "kind": "agent",
     "text": "Drafts the bank invoice; writes validated revenue to the ledger"
    },
    {
     "who": "Finance",
     "kind": "person",
     "text": "Sends the invoice to the bank"
    }
   ],
   "away": "Mapping and splitting by hand; line-by-line checks of matched lines; printing emails for audit",
   "measure": "Days from bank report to close; share of lines matched automatically",
   "lead": "Finance",
   "rep": [
    "WF-RETRO-001"
   ],
   "todayAlt": null
  },
  "commission": {
   "title": "Commission calculation and payout",
   "agents": [
    "Revenue Statement"
   ],
   "wave": 2,
   "owner": "Finance, with the outsourced accountant",
   "trigger": "The quarterly retro cycle closes",
   "change": "Statements are built from validated revenue, every line traceable",
   "today": "Commission is computed in Excel by the outsourced accountant; statements are printed to letters and uploaded to Deel two days before payout.",
   "steps": [
    {
     "who": "Revenue Statement",
     "kind": "agent",
     "text": "Pulls validated revenue by staff code from the ledger"
    },
    {
     "who": "Revenue Statement",
     "kind": "agent",
     "text": "Applies the formula and each RM's sharing percentage"
    },
    {
     "who": "Revenue Statement",
     "kind": "agent",
     "text": "Drafts each RM's statement; flags large swings against last quarter"
    },
    {
     "who": "Finance",
     "kind": "person",
     "text": "Reviews the flagged items with the accountant"
    },
    {
     "who": "Finance",
     "kind": "decision",
     "text": "Approves the statements"
    },
    {
     "who": "Revenue Statement",
     "kind": "agent",
     "text": "Publishes statements to Deel and tells each RM"
    },
    {
     "who": "RM",
     "kind": "person",
     "text": "Raises any query in one tracked queue"
    },
    {
     "who": "Finance",
     "kind": "decision",
     "text": "Releases the payout"
    }
   ],
   "away": "Rebuilding the Excel model each quarter; the print-to-letter step",
   "measure": "Days from retro close to payout",
   "lead": "Finance",
   "rep": [
    "WF-COMM-001",
    "WF-COMM-002"
   ],
   "todayAlt": null
  },
  "feeletter": {
   "title": "Client fee letter",
   "agents": [
    "Fee Letter Drafter"
   ],
   "wave": 3,
   "owner": "Legal",
   "trigger": "Fee terms agreed at onboarding, or changed later",
   "change": "Agreed terms flow into the letter and Finance's fee schedule in one step",
   "today": "Legal prepares the letter from a template, sends it through the ARM, revises it as terms are negotiated, and copies Finance.",
   "steps": [
    {
     "who": "RM",
     "kind": "person",
     "text": "Records the agreed terms in the onboarding case"
    },
    {
     "who": "Fee Letter Drafter",
     "kind": "agent",
     "text": "Fills the template and flags any non-standard term"
    },
    {
     "who": "Legal",
     "kind": "decision",
     "text": "Approves the letter, or agrees changes with the RM"
    },
    {
     "who": "ARM",
     "kind": "person",
     "text": "Sends the letter to the client for signature"
    },
    {
     "who": "Fee Letter Drafter",
     "kind": "agent",
     "text": "Files the signed letter; writes the terms to Finance's fee schedule"
    }
   ],
   "away": "Typing the same terms into the letter and again into Finance's records",
   "measure": "Rounds of revision; days to a signed letter",
   "lead": "RM",
   "rep": [
    "WF-ONB-002"
   ],
   "todayAlt": null
  },
  "close": {
   "title": "Period-end close and payables",
   "agents": [
    "Close and AP"
   ],
   "wave": 3,
   "owner": "Finance, with the outsourced accountant",
   "trigger": "Month end, with invoices and claims arriving through the month",
   "change": "Invoices arrive coded by staff code; Finance reviews exceptions only",
   "today": "Invoices and claims are tracked by staff code and general code, then recorded in Xero by the outsourced accountant.",
   "steps": [
    {
     "who": "Vendors and staff",
     "kind": "person",
     "text": "Send invoices and expense claims to one Finance inbox"
    },
    {
     "who": "Close and AP",
     "kind": "agent",
     "text": "Reads each document; tags staff code and account code"
    },
    {
     "who": "Close and AP",
     "kind": "agent",
     "text": "Flags duplicates, missing approvals and unusual amounts"
    },
    {
     "who": "Finance",
     "kind": "decision",
     "text": "Reviews the flags and approves the batch"
    },
    {
     "who": "Accountant",
     "kind": "person",
     "text": "Posts the entries to Xero"
    },
    {
     "who": "Close and AP",
     "kind": "agent",
     "text": "Drafts the accruals list and management report inputs"
    },
    {
     "who": "Finance",
     "kind": "decision",
     "text": "Releases payments in DBS and signs off the close"
    }
   ],
   "away": "Keying and coding each invoice by hand",
   "measure": "Days to close",
   "lead": "Finance",
   "rep": [
    "WF-PEC-001"
   ],
   "todayAlt": null
  },
  "aum": {
   "title": "AUM and HQ reporting",
   "agents": [
    "Management Insights"
   ],
   "wave": 4,
   "owner": "Finance; the MD approves",
   "trigger": "Month end",
   "change": "Built from the trade record, not from bank statements read by hand",
   "today": "ARMs read bank statements by hand for AUM; reports are built from the blotters; the HQ update goes to the MD by email.",
   "steps": [
    {
     "who": "PMS",
     "kind": "person",
     "text": "Holds positions from the trade record and bank data"
    },
    {
     "who": "Management Insights",
     "kind": "agent",
     "text": "Compiles AUM by RM, bank and category"
    },
    {
     "who": "Management Insights",
     "kind": "agent",
     "text": "Reconciles totals to bank statements; flags differences"
    },
    {
     "who": "Finance",
     "kind": "person",
     "text": "Resolves the differences"
    },
    {
     "who": "MD",
     "kind": "decision",
     "text": "Approves the HQ submission"
    },
    {
     "who": "Finance",
     "kind": "person",
     "text": "Submits to the HQ reporting platform"
    }
   ],
   "away": "Reading statements by hand; consolidating a blotter per RM",
   "measure": "Days from month end to HQ submission",
   "lead": "Finance",
   "rep": [
    "WF-AUM-001"
   ],
   "todayAlt": null
  }
 },
 "agents": [
  {
   "name": "Market Trend",
   "pod": "RM Desk",
   "wave": 1,
   "lives": "Morning brief in Gmail; call list in the CRM",
   "signs": "RM"
  },
  {
   "name": "Portfolio Review",
   "pod": "RM Desk",
   "wave": 1,
   "lives": "The client's CRM record",
   "signs": "RM"
  },
  {
   "name": "Portfolio Proposal",
   "pod": "RM Desk",
   "wave": 2,
   "lives": "The client's CRM record",
   "signs": "RM"
  },
  {
   "name": "CRM assistant",
   "pod": "RM Desk",
   "wave": 1,
   "lives": "ChatGPT Enterprise",
   "signs": "RM"
  },
  {
   "name": "Onboarding Tracker",
   "pod": "Onboarding & Compliance",
   "wave": 2,
   "lives": "One case shared by RM, ARM and Compliance",
   "signs": "ARM"
  },
  {
   "name": "Source-of-Wealth check",
   "pod": "Onboarding & Compliance",
   "wave": 1,
   "lives": "Compliance onboarding queue",
   "signs": "Compliance"
  },
  {
   "name": "Pre-trade Check",
   "pod": "Onboarding & Compliance",
   "wave": 3,
   "lives": "Compliance approval inbox",
   "signs": "Compliance"
  },
  {
   "name": "Trade Alert Triage",
   "pod": "Onboarding & Compliance",
   "wave": 3,
   "lives": "Beside each trade alert",
   "signs": "Compliance"
  },
  {
   "name": "Revenue Assurance",
   "pod": "Revenue & Finance",
   "wave": 2,
   "lives": "Finance retro cycle; one form per ARM",
   "signs": "Finance"
  },
  {
   "name": "Revenue Statement",
   "pod": "Revenue & Finance",
   "wave": 2,
   "lives": "Finance commission cycle, before Deel",
   "signs": "Finance"
  },
  {
   "name": "Fee Letter Drafter",
   "pod": "Revenue & Finance",
   "wave": 3,
   "lives": "Legal's template folder",
   "signs": "Legal"
  },
  {
   "name": "Close and AP",
   "pod": "Revenue & Finance",
   "wave": 3,
   "lives": "Finance inbox at month end",
   "signs": "Finance"
  },
  {
   "name": "Product Library",
   "pod": "Investment & Insight",
   "wave": 3,
   "lives": "Inside Portfolio Proposal; ChatGPT Enterprise",
   "signs": "Risk & Product"
  },
  {
   "name": "Research Analyst Team",
   "pod": "Investment & Insight",
   "wave": 4,
   "lives": "Investment team research notes",
   "signs": "Portfolio Manager"
  },
  {
   "name": "Management Insights",
   "pod": "Investment & Insight",
   "wave": 4,
   "lives": "Monthly management pack",
   "signs": "COO"
  }
 ],
 "teams": [
  {
   "id": "advise",
   "name": "Advise and invest",
   "orchestrator": "Relationship Manager",
   "short": "RM",
   "decides": [
    "RM",
    "Compliance (trades)",
    "Portfolio Managers"
   ],
   "stages": [
    {
     "id": "spot",
     "name": "Spot opportunities",
     "wfs": [
      "Market Monitoring & Outreach"
     ],
     "exhibit": true,
     "today": "Research happens when an ARM has spare time; RMs with a Central ARM mostly do it alone",
     "agents": [
      [
       "Market Trend",
       "Scans overnight news and prices; maps each move to the clients who hold it; ranks who to call"
      ],
      [
       "Research Analyst Team",
       "Writes the research notes Market Trend draws on"
      ]
     ],
     "people": [
      [
       "RM",
       "Decides who to call and what to say",
       "d"
      ]
     ],
     "skills": [
      [
       "Prioritising clients",
       "g"
      ],
      [
       "Checking agent output",
       "g"
      ]
     ]
    },
    {
     "id": "review",
     "name": "Review portfolios",
     "wfs": [
      "WF-PR-001"
     ],
     "exhibit": true,
     "today": "The RM pulls statements by hand from several bank platforms; prep depends on the ARM pairing",
     "agents": [
      [
       "Portfolio Review",
       "Pulls holdings; flags changes against mandate and last review; drafts the pack and follow-up"
      ]
     ],
     "people": [
      [
       "RM",
       "Edits and approves the pack; runs the meeting; sends the follow-up",
       "d"
      ]
     ],
     "skills": [
      [
       "Client conversations",
       "g"
      ],
      [
       "Portfolio analysis",
       "k"
      ]
     ]
    },
    {
     "id": "propose",
     "name": "Propose",
     "wfs": [
      "WF-CA-001"
     ],
     "exhibit": true,
     "today": "The RM gathers the profile, then pulls product material from PDFs and spreadsheets",
     "agents": [
      [
       "Portfolio Proposal",
       "Drafts the allocation, rationale, deck and email"
      ],
      [
       "Product Library",
       "Answers product questions, with sources"
      ]
     ],
     "people": [
      [
       "RM",
       "Approves or changes the portfolio; agrees it with the client",
       "d"
      ]
     ],
     "skills": [
      [
       "Investment judgment",
       "g"
      ],
      [
       "Suitability",
       "k"
      ]
     ]
    },
    {
     "id": "execute",
     "name": "Execute trades",
     "wfs": [
      "WF-TRADE-001",
      "WF-TRADE-002"
     ],
     "exhibit": true,
     "today": "The ARM emails Compliance in free format; each trade is re-keyed into a blotter per RM",
     "agents": [
      [
       "Pre-trade Check",
       "Checks lists and risk profile; drafts the approval note; records the trade once"
      ],
      [
       "CRM assistant",
       "Logs the outcome and next steps in the CRM"
      ]
     ],
     "people": [
      [
       "Compliance",
       "Approves or refers the trade, independently",
       "d"
      ],
      [
       "ARM",
       "Instructs the bank from a template",
       "p"
      ]
     ],
     "skills": [
      [
       "Handling exceptions",
       "g"
      ],
      [
       "Regulatory judgment",
       "k"
      ]
     ]
    },
    {
     "id": "portfolios",
     "name": "Manage portfolios",
     "wfs": [
      "WF-PM-001",
      "WF-FO-001"
     ],
     "exhibit": false,
     "today": "Named in the V4 master; not yet mapped step by step",
     "agents": [
      [
       "Research Analyst Team",
       "Research notes for the investment team"
      ]
     ],
     "people": [
      [
       "Portfolio Managers",
       "Make every investment decision",
       "d"
      ]
     ],
     "skills": []
    }
   ]
  },
  {
   "id": "onboard",
   "name": "Onboard and look after clients",
   "orchestrator": "ARM",
   "short": "ARM",
   "orch_note": "Runs each case end to end; Compliance and Legal decide",
   "decides": [
    "Compliance",
    "Legal"
   ],
   "stages": [
    {
     "id": "open",
     "name": "Open the case",
     "wfs": [
      "WF-ONB-001"
     ],
     "exhibit": true,
     "today": "The RM briefs the ARM, who emails the client for documents; the RM cannot see progress",
     "agents": [
      [
       "Onboarding Tracker",
       "Opens one case everyone can see; drafts the document request; chases the client"
      ]
     ],
     "people": [
      [
       "ARM",
       "Owns the case end to end",
       "p"
      ],
      [
       "RM",
       "Logs the new client and the agreed fee terms",
       "p"
      ]
     ],
     "skills": [
      [
       "Owning a case end to end",
       "g"
      ],
      [
       "Client communication",
       "k"
      ]
     ]
    },
    {
     "id": "check",
     "name": "Check documents",
     "wfs": [
      "AML/KYC"
     ],
     "exhibit": true,
     "today": "The ARM checks documents against the checklist by hand; verifying them is the bottleneck",
     "agents": [
      [
       "Source-of-Wealth check",
       "Reads each document; drafts the pre-check memo with gaps flagged"
      ]
     ],
     "people": [
      [
       "ARM",
       "Resolves the gaps with the client",
       "p"
      ]
     ],
     "skills": [
      [
       "Reviewing agent findings",
       "g"
      ]
     ]
    },
    {
     "id": "decide",
     "name": "Decide",
     "wfs": [],
     "exhibit": true,
     "today": "Compliance screens on Factiva and decides; requests and replies go by email",
     "agents": [],
     "people": [
      [
       "Compliance",
       "Screens the client; approves, asks for more or declines; sets the risk rating",
       "d"
      ]
     ],
     "skills": [
      [
       "Regulatory judgment",
       "k"
      ]
     ]
    },
    {
     "id": "accounts",
     "name": "Open accounts and agree fees",
     "wfs": [
      "WF-ONB-002",
      "WF-ONB-003"
     ],
     "exhibit": true,
     "today": "The ARM fills each bank's own forms by hand; fee terms are typed again for Finance",
     "agents": [
      [
       "Onboarding Tracker",
       "Pre-fills each bank's forms; writes the client once to the shared record"
      ],
      [
       "Fee Letter Drafter",
       "Fills the fee letter; flags non-standard terms; sends the terms to Finance"
      ]
     ],
     "people": [
      [
       "Legal",
       "Approves the fee letter",
       "d"
      ],
      [
       "ARM",
       "Submits the forms to the bank",
       "p"
      ]
     ],
     "skills": [
      [
       "Spotting non-standard terms",
       "g"
      ],
      [
       "Bank coordination",
       "k"
      ]
     ]
    },
    {
     "id": "records",
     "name": "Keep client records current",
     "wfs": [
      "Client Document Review",
      "Client Periodic Review",
      "Client Data Record",
      "Client Risk Assessment Annual",
      "WF-CMON-004"
     ],
     "exhibit": false,
     "today": "Named in the Compliance list; not yet mapped step by step",
     "agents": [
      [
       "Onboarding Tracker",
       "Later: flags expiring documents and due reviews"
      ]
     ],
     "people": [
      [
       "Compliance",
       "Decides each periodic review",
       "d"
      ]
     ],
     "skills": []
    }
   ]
  },
  {
   "id": "protect",
   "name": "Protect the firm",
   "orchestrator": "Compliance",
   "short": "Compliance",
   "orch_note": "Stays independent of the teams it checks",
   "decides": [
    "Compliance"
   ],
   "stages": [
    {
     "id": "monitor",
     "name": "Approve and monitor trades",
     "wfs": [
      "WF-TRADE-003",
      "Trade Monitoring",
      "WF-SURV-003",
      "WF-SURV-002"
     ],
     "exhibit": false,
     "today": "Approval requests arrive by email in free format; alert reviews start from a blank page",
     "agents": [
      [
       "Pre-trade Check",
       "Checks each request against the lists and the client; drafts the note"
      ],
      [
       "Trade Alert Triage",
       "Pulls the context behind each alert; drafts a disposition"
      ]
     ],
     "people": [
      [
       "Compliance",
       "Decides every trade approval and closes every alert",
       "d"
      ]
     ],
     "skills": []
    },
    {
     "id": "staff",
     "name": "Partners and staff",
     "wfs": [
      "WF-BP-001",
      "Business Partners Periodic Review",
      "Staff Onboarding",
      "Staff Declaration Quarterly",
      "Fit and Proper Annual",
      "Staff Screening Annual",
      "WF-STAFF-005"
     ],
     "exhibit": false,
     "today": "Named in the Compliance list; not yet mapped step by step",
     "agents": [],
     "people": [
      [
       "Compliance",
       "Runs and decides these checks",
       "d"
      ]
     ],
     "skills": []
    },
    {
     "id": "regulators",
     "name": "Regulators and audit",
     "wfs": [
      "Marketing Material Review",
      "New Product Approval",
      "External Audit Support",
      "MAS Notifications and Submissions",
      "Internal Audit"
     ],
     "exhibit": false,
     "today": "Named in the Compliance list; not yet mapped step by step",
     "agents": [],
     "people": [
      [
       "Compliance",
       "Owns every regulator and audit response",
       "d"
      ]
     ],
     "skills": []
    }
   ]
  },
  {
   "id": "revenue",
   "name": "Get paid and pay out",
   "orchestrator": "Finance",
   "short": "Finance",
   "orch_note": "Owns revenue and payouts; ARMs clear only the breaks in their book",
   "decides": [
    "Finance",
    "RMs confirm their figures"
   ],
   "stages": [
    {
     "id": "collect",
     "name": "Collect and read reports",
     "wfs": [
      "WF-TM-001"
     ],
     "exhibit": true,
     "today": "Finance splits each bank report by hand and emails each ARM their slice",
     "agents": [
      [
       "Revenue Assurance",
       "Reads every bank report, Excel or PDF, into one format; maps each line to an RM"
      ]
     ],
     "people": [],
     "skills": [
      [
       "Data quality",
       "g"
      ]
     ]
    },
    {
     "id": "match",
     "name": "Match",
     "wfs": [
      "WF-RETRO-001",
      "WF-RETRO-002"
     ],
     "exhibit": true,
     "today": "Each ARM checks every line against the trade blotter, a Google Sheet",
     "agents": [
      [
       "Revenue Assurance",
       "Matches reported fees to expected fees in the trade record; flags the breaks"
      ]
     ],
     "people": [],
     "skills": []
    },
    {
     "id": "breaks",
     "name": "Clear the breaks",
     "wfs": [
      "WF-FEES-002"
     ],
     "exhibit": true,
     "today": "ARMs query the banks and their RMs; each replies to Finance in their own format",
     "agents": [
      [
       "Revenue Assurance",
       "Sends each ARM only the breaks for their RMs; drafts the bank queries"
      ]
     ],
     "people": [
      [
       "ARM",
       "Works the breaks with the bank",
       "p"
      ],
      [
       "RM",
       "Confirms their figures",
       "d"
      ]
     ],
     "skills": [
      [
       "Handling exceptions",
       "g"
      ],
      [
       "Bank relationships",
       "k"
      ]
     ]
    },
    {
     "id": "invoice",
     "name": "Invoice and record",
     "wfs": [
      "WF-FEES-001"
     ],
     "exhibit": true,
     "today": "Finance raises invoices from the collated emails, which are printed as audit evidence",
     "agents": [
      [
       "Revenue Assurance",
       "Drafts each bank invoice; writes validated revenue to the ledger with its audit trail"
      ]
     ],
     "people": [
      [
       "Finance",
       "Approves the allocation per RM per bank; sends the invoices",
       "d"
      ]
     ],
     "skills": [
      [
       "Designing controls",
       "g"
      ]
     ]
    },
    {
     "id": "payout",
     "name": "Pay commission",
     "wfs": [
      "WF-COMM-001",
      "WF-COMM-002",
      "WF-FEES-003",
      "Payroll"
     ],
     "exhibit": true,
     "today": "Commission is rebuilt in Excel; statements are printed to PDF and uploaded to Deel one by one",
     "agents": [
      [
       "Revenue Statement",
       "Applies each RM's sharing formula; drafts statements; flags large swings; publishes to Deel"
      ]
     ],
     "people": [
      [
       "Finance",
       "Approves the statements and releases the payout in DBS",
       "d"
      ]
     ],
     "skills": [
      [
       "Approving by exception",
       "g"
      ]
     ]
    }
   ]
  },
  {
   "id": "report",
   "name": "Close and report",
   "orchestrator": "Finance",
   "short": "Finance",
   "orch_note": "With the COO office; the MD approves what goes to HQ",
   "decides": [
    "Finance",
    "MD",
    "Management"
   ],
   "stages": [
    {
     "id": "close",
     "name": "Close the books",
     "wfs": [
      "WF-PEC-001"
     ],
     "exhibit": true,
     "today": "Finance renames and codes each invoice by hand; the outsourced accountant records it in Xero",
     "agents": [
      [
       "Close and AP",
       "Reads each invoice; tags staff and account codes; flags duplicates and missing approvals; drafts accruals"
      ]
     ],
     "people": [
      [
       "Finance",
       "Reviews the flags, approves the batch and releases payments",
       "d"
      ]
     ],
     "skills": [
      [
       "Approving by exception",
       "g"
      ]
     ]
    },
    {
     "id": "aum",
     "name": "Compile AUM",
     "wfs": [
      "WF-AUM-001"
     ],
     "exhibit": true,
     "today": "ARMs update AUM in their blotters from month-end bank statements; Finance checks line by line",
     "agents": [
      [
       "Management Insights",
       "Compiles AUM by RM, bank and category; reconciles to bank statements; flags differences"
      ]
     ],
     "people": [
      [
       "Finance",
       "Resolves the differences",
       "p"
      ]
     ],
     "skills": [
      [
       "Data quality",
       "g"
      ]
     ]
    },
    {
     "id": "hq",
     "name": "Report to HQ",
     "wfs": [
      "WF-MR-002",
      "WF-MR-001",
      "MAS Quarterly & Annual Reporting",
      "External Audit"
     ],
     "exhibit": true,
     "today": "Finance enters the figures into Raccolta and emails the MD for approval",
     "agents": [
      [
       "Management Insights",
       "Prepares the HQ submission and the breakdown for the MD"
      ]
     ],
     "people": [
      [
       "MD",
       "Approves the HQ submission",
       "d"
      ]
     ],
     "skills": [
      [
       "Explaining the numbers",
       "k"
      ]
     ]
    },
    {
     "id": "steer",
     "name": "Steer the firm",
     "wfs": [],
     "exhibit": true,
     "today": "Management packs are assembled by email",
     "agents": [
      [
       "Management Insights",
       "Keeps a live view of AUM, revenue, pipeline and control metrics"
      ]
     ],
     "people": [
      [
       "Management",
       "Sets priorities; approves new agents and how much each may do alone",
       "d"
      ]
     ],
     "skills": [
      [
       "Running a team of agents",
       "g"
      ]
     ]
    }
   ]
  }
 ]
};
