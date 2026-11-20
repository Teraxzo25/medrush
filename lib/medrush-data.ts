export type Role = "Citizen" | "Dispatch Centre" | "Responder" | "Hospital" | "Administration";
export type RequestStatus = "Incoming" | "Offered" | "Accepted" | "En route" | "At scene" | "Completed" | "Declined";
export type PaymentStatus = "Pending" | "Processing" | "Successful" | "Failed" | "Reversed";
export type Emergency = { id: string; name: string; category: string; location: string; phone: string; relativeName?: string; relativePhone?: string; status: RequestStatus; ambulance?: string; hospital?: string; created: string; verified: boolean; age?: number };
export type FundRequest = { id: string; emergencyId: string; person: string; category: string; amount: number; hospital: string; decision: "Approved" | "Declined" | "Review"; reason: string; grant: number; advance: number; date: string; overdue?: boolean; reference?: string };
export type Payment = { reference: string; requestId: string; hospital: string; amount: number; status: PaymentStatus; date: string; person: string };
export type AmbulanceUnit = { id: string; driver: string; area: string; status: "Available" | "En route" | "On scene"; eta: string };
export type DemoActivity = { id: string; message: string; role: Role; page: string; time: string };
export type FundSettings = { elderlyAge: number; minRequest: number; grantLimit: number; frequency: number; repaymentDays: number };
export const initialEmergencies: Emergency[] = [
 { id:"MR-24081", name:"Esther Udo", category:"Road traffic crash", location:"Ikot Ekpene Road, Uyo", phone:"0803 ••• 4821", status:"Incoming", created:"2 min ago", verified:true },
 { id:"MR-24080", name:"Aniekan Akpan", category:"Pregnancy or childbirth", location:"Ewet Housing Estate, Uyo", phone:"0806 ••• 1932", status:"Accepted", ambulance:"AMB-04", hospital:"University of Uyo Teaching Hospital", created:"8 min ago", verified:true },
 { id:"MR-24079", name:"Grace Okon", category:"Elderly patient", location:"Oron Road, Uyo", phone:"0705 ••• 6074", status:"En route", ambulance:"AMB-02", hospital:"St. Luke’s Hospital, Anua", created:"14 min ago", verified:true, age:72 },
];
export const initialFunds: FundRequest[] = [
 { id:"EF-1092", emergencyId:"MR-24080", person:"Aniekan Akpan", category:"Pregnancy or childbirth", amount:45000, hospital:"University of Uyo Teaching Hospital", decision:"Approved", reason:"All eligibility checks passed", grant:30000, advance:15000, date:"Today, 10:42 AM", reference:"PAGA-SBX-40921" },
 { id:"EF-1091", emergencyId:"MR-24079", person:"Grace Okon", category:"Elderly patient", amount:18000, hospital:"St. Luke’s Hospital, Anua", decision:"Approved", reason:"Age 72 meets the configured threshold", grant:18000, advance:0, date:"Today, 10:18 AM", reference:"PAGA-SBX-40908" },
 { id:"EF-1090", emergencyId:"MR-24072", person:"Imaobong Ekanem", category:"Minor injury or illness", amount:12000, hospital:"Ibom Specialist Hospital", decision:"Review", reason:"Repeat request pattern flagged for administrator review", grant:0, advance:0, date:"Today, 9:36 AM" },
 { id:"EF-1089", emergencyId:"MR-24067", person:"Bassey James", category:"Road traffic crash", amount:25000, hospital:"Ibom Specialist Hospital", decision:"Declined", reason:"Phone number is not verified", grant:0, advance:0, date:"Yesterday, 4:12 PM" },
 { id:"EF-1088", emergencyId:"MR-24061", person:"Nsikak John", category:"Minor injury or illness", amount:52000, hospital:"General Hospital, Ikot Ekpene", decision:"Approved", reason:"Repayable advance outstanding · repayment overdue", grant:30000, advance:22000, date:"12 Nov 2026", overdue:true, reference:"PAGA-SBX-40211" },
];
export const initialPayments: Payment[] = [
 {reference:"PAGA-SBX-40921",requestId:"EF-1092",hospital:"University of Uyo Teaching Hospital",amount:45000,status:"Successful",date:"Today, 10:42 AM",person:"Aniekan Akpan"},
 {reference:"PAGA-SBX-40908",requestId:"EF-1091",hospital:"St. Luke’s Hospital, Anua",amount:18000,status:"Successful",date:"Today, 10:18 AM",person:"Grace Okon"},
];
export const initialActivity: DemoActivity[] = [
 {id:"activity-1",message:"Incoming emergency · MR-24081",role:"Dispatch Centre",page:"Emergency queue",time:"2 min ago"},
 {id:"activity-2",message:"Hospital pre-alert acknowledged",role:"Hospital",page:"Incoming arrivals",time:"8 min ago"},
];
export const initialFundSettings: FundSettings = {elderlyAge:60,minRequest:5000,grantLimit:30000,frequency:2,repaymentDays:30};
export const ambulances: AmbulanceUnit[] = [ {id:"AMB-01", driver:"Etim Essien", area:"Uyo Central", status:"Available", eta:"4 min"}, {id:"AMB-02", driver:"Mfon Udo", area:"Oron Road", status:"En route", eta:"6 min"}, {id:"AMB-03", driver:"David Okon", area:"Ikot Ekpene Rd", status:"Available", eta:"7 min"}, {id:"AMB-04", driver:"Samuel Akpan", area:"Ewet Housing", status:"On scene", eta:"—"} ];
export const hospitals = ["University of Uyo Teaching Hospital", "St. Luke’s Hospital, Anua", "Ibom Specialist Hospital", "General Hospital, Ikot Ekpene"];
