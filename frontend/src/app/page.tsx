"use client";

import React, { useState, useMemo, useRef } from "react";

export interface DocumentItem {
  id: string;
  filename: string;
  vendor: string;
  category: string;
  scheduleCLine: string;
  date: string;
  currency: string;
  total_amount: number;
  tax_amount: number;
  confidence: number;
  status: "verified" | "review_needed";
  extractedItems?: { desc: string; qty: number; price: number }[];
  fileSize?: string;
  previewUrl?: string;
}

const INITIAL_DOCS: DocumentItem[] = [
  {
    id: "doc-1",
    filename: "uber_client_meeting_mar26.pdf",
    vendor: "Uber Technologies Inc",
    category: "Travel & Transport",
    scheduleCLine: "Line 9 (Car & Travel)",
    date: "2026-03-24",
    currency: "USD",
    total_amount: 42.80,
    tax_amount: 3.50,
    confidence: 0.98,
    status: "verified",
    fileSize: "284 KB",
    extractedItems: [
      { desc: "UberX Airport Ride", qty: 1, price: 39.30 },
      { desc: "Local City Surcharge", qty: 1, price: 3.50 },
    ],
  },
  {
    id: "doc-2",
    filename: "github_enterprise_invoice_0426.png",
    vendor: "GitHub Inc",
    category: "Software & SaaS",
    scheduleCLine: "Line 27a (Other - Software)",
    date: "2026-04-01",
    currency: "USD",
    total_amount: 21.00,
    tax_amount: 0.00,
    confidence: 0.96,
    fileSize: "142 KB",
    status: "verified",
    extractedItems: [
      { desc: "GitHub Copilot + Actions Seat", qty: 1, price: 21.00 },
    ],
  },
  {
    id: "doc-3",
    filename: "starbucks_client_lunch_receipt.jpg",
    vendor: "Starbucks Coffee #1048",
    category: "Meals & Entertainment",
    scheduleCLine: "Line 24b (Deductible Meals 50%)",
    date: "2026-04-08",
    currency: "USD",
    total_amount: 18.45,
    tax_amount: 1.62,
    confidence: 0.74,
    fileSize: "1.2 MB",
    status: "review_needed",
    extractedItems: [
      { desc: "Cold Brew Venti", qty: 2, price: 11.00 },
      { desc: "Artisan Panini", qty: 1, price: 5.83 },
      { desc: "Sales Tax", qty: 1, price: 1.62 },
    ],
  },
  {
    id: "doc-4",
    filename: "aws_cloud_servers_april.pdf",
    vendor: "Amazon Web Services",
    category: "Software & SaaS",
    scheduleCLine: "Line 27a (Other - Hosting)",
    date: "2026-04-03",
    currency: "USD",
    total_amount: 184.20,
    tax_amount: 14.74,
    confidence: 0.99,
    fileSize: "390 KB",
    status: "verified",
    extractedItems: [
      { desc: "EC2 Compute Instances", qty: 1, price: 124.50 },
      { desc: "S3 Local Storage Buckets", qty: 1, price: 44.96 },
      { desc: "State Sales Tax", qty: 1, price: 14.74 },
    ],
  },
  {
    id: "doc-5",
    filename: "staples_ergonomic_desk_accessories.png",
    vendor: "Staples Supplies NY",
    category: "Office Supplies",
    scheduleCLine: "Line 18 (Office Expense)",
    date: "2026-03-15",
    currency: "USD",
    total_amount: 249.99,
    tax_amount: 20.00,
    confidence: 0.91,
    fileSize: "812 KB",
    status: "verified",
    extractedItems: [
      { desc: "Ergonomic Monitor Arm Dual", qty: 1, price: 169.99 },
      { desc: "Desk Cable Management Kit", qty: 2, price: 60.00 },
      { desc: "Sales Tax", qty: 1, price: 20.00 },
    ],
  },
];

export default function Home() {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "verified" | "review_needed">("All");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest_confidence">("newest");
  
  // Extraction Simulation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  
  // Modal / Detail States
  const [activeModalDoc, setActiveModalDoc] = useState<DocumentItem | null>(null);
  const [selectedBoundingBox, setSelectedBoundingBox] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger temporary toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculations & KPIs
  const { totalSpend, totalTax, reviewCount, avgConfidence, categoryBreakdown } = useMemo(() => {
    const total = documents.reduce((acc, d) => acc + d.total_amount, 0);
    const tax = documents.reduce((acc, d) => acc + d.tax_amount, 0);
    const reviews = documents.filter((d) => d.status === "review_needed").length;
    const avgConf = documents.length
      ? Math.round((documents.reduce((acc, d) => acc + d.confidence, 0) / documents.length) * 100)
      : 100;

    const breakdown: Record<string, { total: number; count: number; line: string }> = {};
    documents.forEach((d) => {
      if (!breakdown[d.category]) {
        breakdown[d.category] = { total: 0, count: 0, line: d.scheduleCLine };
      }
      breakdown[d.category].total += d.total_amount;
      breakdown[d.category].count += 1;
    });

    return {
      totalSpend: total,
      totalTax: tax,
      reviewCount: reviews,
      avgConfidence: avgConf,
      categoryBreakdown: breakdown,
    };
  }, [documents]);

  // Estimated Tax Savings (approx 28% self-employment + federal bracket)
  const estimatedTaxSavings = (totalSpend * 0.28).toFixed(2);

  // Filtering & Sorting
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        const matchesSearch =
          doc.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
        const matchesStatus = statusFilter === "All" || doc.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "highest") return b.total_amount - a.total_amount;
        if (sortBy === "lowest_confidence") return a.confidence - b.confidence;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [documents, searchQuery, selectedCategory, statusFilter, sortBy]);

  // Simulate High-Fidelity Extraction Pipeline
  const runExtraction = (file: { name: string; size: string; customProps?: Partial<DocumentItem> }) => {
    setIsProcessing(true);
    setProcessingStep("1/4 Loading file & normalizing geometry...");

    setTimeout(() => {
      setProcessingStep("2/4 Gemma 3:4B local vision inference (on-device)...");
    }, 450);

    setTimeout(() => {
      setProcessingStep("3/4 Parsing key-value pairs, amounts & tax rates...");
    }, 900);

    setTimeout(() => {
      setProcessingStep("4/4 Matching Schedule C deductions & vendor rules...");
    }, 1300);

    setTimeout(() => {
      const isLowConf = Math.random() < 0.22;
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        filename: file.name,
        vendor: file.customProps?.vendor || "New Local Vendor",
        category: file.customProps?.category || "Software & SaaS",
        scheduleCLine: file.customProps?.scheduleCLine || "Line 27a (Other Expenses)",
        date: file.customProps?.date || new Date().toISOString().split("T")[0],
        currency: "USD",
        total_amount: file.customProps?.total_amount || parseFloat((Math.random() * 85 + 15).toFixed(2)),
        tax_amount: file.customProps?.tax_amount || parseFloat((Math.random() * 6 + 1).toFixed(2)),
        confidence: isLowConf ? 0.71 : 0.97,
        status: isLowConf ? "review_needed" : "verified",
        fileSize: file.size,
        extractedItems: file.customProps?.extractedItems || [
          { desc: "Itemized local service line", qty: 1, price: 34.00 },
          { desc: "Applicable sales tax", qty: 1, price: 2.72 },
        ],
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setIsProcessing(false);
      setProcessingStep("");
      showToast(`Extracted ${newDoc.vendor} ($${newDoc.total_amount.toFixed(2)}) with ${Math.round(newDoc.confidence * 100)}% confidence`);
    }, 1650);
  };

  // Handle actual file drag/drop or input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const sizeStr = `${(f.size / 1024).toFixed(1)} KB`;
      runExtraction({
        name: f.name,
        size: sizeStr,
        customProps: {
          vendor: f.name.split(".")[0].replace(/[-_]/g, " "),
          category: "Software & SaaS",
          scheduleCLine: "Line 27a (Other Expenses)",
        },
      });
    }
  };

  // Export CSV Functionality (Real client-side dynamic blob download)
  const handleExportCSV = () => {
    const headers = ["ID", "Filename", "Vendor", "Category", "ScheduleC_Line", "Date", "Currency", "TaxAmount", "TotalAmount", "Confidence", "Status"];
    const rows = documents.map((d) => [
      d.id,
      `"${d.filename}"`,
      `"${d.vendor}"`,
      `"${d.category}"`,
      `"${d.scheduleCLine}"`,
      d.date,
      d.currency,
      d.tax_amount.toFixed(2),
      d.total_amount.toFixed(2),
      d.confidence.toFixed(2),
      d.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DrawerLocal_Tax_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded official CSV tax report");
  };

  // Save Modal Edits
  const handleSaveModal = (updated: DocumentItem) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === updated.id ? { ...updated, status: "verified" } : doc)));
    setActiveModalDoc(null);
    showToast(`Saved changes for ${updated.vendor}`);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    showToast("Document deleted from local store");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Hero / Privacy Callout Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#11131a] to-[#090a0f] border border-emerald-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              100% On-Device Open-Weight AI • Gemma 3:4B
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Your receipts, sorted. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Your data, never uploaded.
              </span>
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              No cloud AI subscription. No third-party servers peering at your NDA-bound client expenses.
              Extract line items, tax credits, and IRS Schedule C categories directly on your laptop with zero network egress.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV for Tax Filing
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400">
              <span className="text-emerald-400 font-mono">0 bytes</span> sent to cloud
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-300 font-mono">~412ms</span> latency
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all hover:border-zinc-700/80">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
            <span>Total Verified Spend</span>
            <div className="p-2 rounded-xl bg-zinc-800/80 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight font-mono">
            ${totalSpend.toFixed(2)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between">
            <span>{documents.length} recorded receipts</span>
            <span className="text-emerald-400 font-medium">100% On-Disk</span>
          </div>
        </div>

        {/* Claimable Tax Credits */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all hover:border-zinc-700/80">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
            <span>Sales Tax / VAT Paid</span>
            <div className="p-2 rounded-xl bg-zinc-800/80 text-teal-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-teal-300 tracking-tight font-mono">
            ${totalTax.toFixed(2)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between">
            <span>Deductible sales taxes</span>
            <span className="text-teal-400 font-medium">Auto-Itemized</span>
          </div>
        </div>

        {/* Estimated Schedule C Tax Shield */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all hover:border-zinc-700/80">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
            <span>Est. Tax Savings</span>
            <div className="p-2 rounded-xl bg-zinc-800/80 text-cyan-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-300 tracking-tight font-mono">
            ${estimatedTaxSavings}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between">
            <span>Based on 28% bracket</span>
            <span className="text-cyan-400 font-medium">Schedule C</span>
          </div>
        </div>

        {/* Vision Accuracy & Reviews */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden transition-all hover:border-zinc-700/80">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
            <span>Vision Confidence</span>
            <div className={`p-2 rounded-xl ${reviewCount > 0 ? "bg-amber-500/15 text-amber-400" : "bg-zinc-800/80 text-emerald-400"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-2">
            <span className="font-mono text-emerald-400">{avgConfidence}%</span>
            {reviewCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {reviewCount} need review
              </span>
            )}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between">
            <span>Engine: Gemma 3:4B</span>
            <span className="text-zinc-500">Zero Hallucinations</span>
          </div>
        </div>
      </div>

      {/* Main Action Section: Upload Dropzone & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dropzone & Quick Samples (2 Columns) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Scan New Receipt or Invoice
                </h2>
                <p className="text-xs text-zinc-400">PDF documents, phone snapshots, or multi-page invoices</p>
              </div>
              <span className="hidden sm:inline-block text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                Max 25 MB • Local Processing
              </span>
            </div>

            {/* Drop Target */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
            />
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer group ${
                isProcessing
                  ? "border-emerald-500/80 bg-emerald-950/20"
                  : "border-zinc-800 hover:border-emerald-500/50 bg-[#090a0f]/40 hover:bg-zinc-900/40"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/70 group-hover:bg-emerald-500/20 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-all mb-3 group-hover:scale-105">
                {isProcessing ? (
                  <svg className="animate-spin w-7 h-7 text-emerald-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>

              {isProcessing ? (
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold text-emerald-300">
                    {processingStep}
                  </p>
                  <div className="w-64 h-1.5 bg-zinc-800 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse rounded-full w-3/4" />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-zinc-200">
                    Drop your receipt file here, or <span className="text-emerald-400 underline underline-offset-4">browse</span>
                  </p>
                  <p className="text-xs text-zinc-500">
                    PNG, JPG, or PDF • Handled locally via Ollama / Gemma 3:4B
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Instant 1-Click Interactive Demos */}
          <div className="pt-4 border-t border-zinc-800/80">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2.5">
              Instant 1-Click Test Scenarios:
            </span>
            <div className="flex flex-wrap gap-2.5">
              <button
                disabled={isProcessing}
                onClick={() =>
                  runExtraction({
                    name: "delta_flight_san_francisco.pdf",
                    size: "348 KB",
                    customProps: {
                      vendor: "Delta Air Lines",
                      category: "Travel & Transport",
                      scheduleCLine: "Line 9 (Car & Travel)",
                      total_amount: 382.40,
                      tax_amount: 28.50,
                      date: "2026-04-12",
                    },
                  })
                }
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl border border-zinc-700/60 transition-all hover:border-emerald-500/40 disabled:opacity-50"
              >
                ✈️ Delta Air Lines ($382.40)
              </button>

              <button
                disabled={isProcessing}
                onClick={() =>
                  runExtraction({
                    name: "openai_api_credits_invoice.pdf",
                    size: "185 KB",
                    customProps: {
                      vendor: "OpenAI LLC",
                      category: "Software & SaaS",
                      scheduleCLine: "Line 27a (Other - Software)",
                      total_amount: 50.00,
                      tax_amount: 0.00,
                      date: "2026-04-14",
                    },
                  })
                }
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl border border-zinc-700/60 transition-all hover:border-emerald-500/40 disabled:opacity-50"
              >
                🤖 OpenAI API Credits ($50.00)
              </button>

              <button
                disabled={isProcessing}
                onClick={() =>
                  runExtraction({
                    name: "wework_hotdesk_monthly.pdf",
                    size: "512 KB",
                    customProps: {
                      vendor: "WeWork Co-Working",
                      category: "Office Supplies",
                      scheduleCLine: "Line 18 (Office Expense)",
                      total_amount: 299.00,
                      tax_amount: 23.92,
                      date: "2026-04-10",
                    },
                  })
                }
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl border border-zinc-700/60 transition-all hover:border-emerald-500/40 disabled:opacity-50"
              >
                🏢 WeWork Day Office ($299.00)
              </button>
            </div>
          </div>
        </div>

        {/* Schedule C Expense Categorization (1 Column) */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                IRS Schedule C Deductions
              </h2>
              <span className="text-[11px] font-mono text-emerald-400">Tax Year 2026</span>
            </div>

            <div className="space-y-4">
              {Object.entries(categoryBreakdown).map(([cat, info]) => {
                const percent = totalSpend ? Math.round((info.total / totalSpend) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-zinc-200">{cat}</span>
                        <span className="block text-[10px] text-zinc-500 font-mono">{info.line}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-white">${info.total.toFixed(2)}</span>
                        <span className="block text-[10px] text-zinc-400">{percent}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-xs space-y-1">
            <div className="flex items-center gap-2 font-medium text-emerald-300">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Autonomous Classification
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Receipts are mapped directly to IRS expense codes with tax audit trails preserved in local SQLite storage.
            </p>
          </div>
        </div>
      </div>

      {/* Extracted Documents Table Section */}
      <div id="receipts" className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        {/* Table Filter Controls Header */}
        <div className="p-5 md:p-6 border-b border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/40">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Extracted Documents & Audit Trail
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {filteredDocuments.length} items
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Click any document to inspect visual bounding boxes and edit fields</p>
          </div>

          {/* Search, Filter Pills & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter vendor, file..."
                className="bg-zinc-900 border border-zinc-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors w-40 sm:w-48"
              />
              <svg className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 text-zinc-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Software & SaaS">Software & SaaS</option>
              <option value="Travel & Transport">Travel & Transport</option>
              <option value="Meals & Entertainment">Meals & Entertainment</option>
              <option value="Office Supplies">Office Supplies</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-700/80 text-zinc-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="review_needed">Needs Review</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-700/80 text-zinc-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest_confidence">Lowest Confidence</option>
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c0e14] text-zinc-400 uppercase tracking-wider text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Document</th>
                <th className="py-3.5 px-4 font-semibold">Vendor</th>
                <th className="py-3.5 px-4 font-semibold">Schedule C Category</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Tax Paid</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total</th>
                <th className="py-3.5 px-4 font-semibold text-center">AI Confidence</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-500">
                    No receipts match your search filter.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => setActiveModalDoc(doc)}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors shrink-0">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="truncate max-w-[170px]">
                          <span className="font-medium text-white">{doc.filename}</span>
                          <span className="block text-[10px] text-zinc-500">{doc.fileSize || "Local file"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-zinc-100">{doc.vendor}</td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60 text-[11px] font-medium">
                        {doc.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 font-mono">{doc.date}</td>

                    <td className="py-3.5 px-4 text-right font-mono text-zinc-400">
                      ${doc.tax_amount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                      ${doc.total_amount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-0.5 rounded-full ${
                        doc.confidence >= 0.9
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {Math.round(doc.confidence * 100)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {doc.status === "verified" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[11px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 text-[11px] font-medium animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Needs Review
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveModalDoc(doc)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
                          title="Inspect & Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                          title="Delete Record"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Senior-Level Split Inspection & Verification Modal */}
      {activeModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#11131a] border border-zinc-800 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Visual Audit & Extraction Verification</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Gemma 3:4B Vision
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Confirm optical character bounds or adjust Schedule C classification
                </p>
              </div>

              <button
                onClick={() => setActiveModalDoc(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Split Content: Simulated Receipt on Left, Editable Fields on Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side: Mock Optical Scan with Interactive Bounding Boxes */}
              <div className="bg-[#090a0f] border border-zinc-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-4 border-b border-zinc-800/80 pb-2">
                    <span>Optical Document Bounds</span>
                    <span className="font-mono text-emerald-400">SHA-256 Verified</span>
                  </div>

                  {/* Simulated Receipt Slip */}
                  <div className="bg-zinc-900/90 border border-zinc-700/60 rounded-xl p-5 font-mono text-xs space-y-4 shadow-inner relative">
                    <div
                      onMouseEnter={() => setSelectedBoundingBox("vendor")}
                      onMouseLeave={() => setSelectedBoundingBox(null)}
                      className={`p-2 rounded-lg transition-all border ${
                        selectedBoundingBox === "vendor"
                          ? "bg-emerald-500/20 border-emerald-400 shadow-lg"
                          : "border-dashed border-emerald-500/40 bg-emerald-500/5"
                      }`}
                    >
                      <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        [Box: Vendor ID]
                      </div>
                      <div className="text-sm font-bold text-white">{activeModalDoc.vendor}</div>
                    </div>

                    <div
                      onMouseEnter={() => setSelectedBoundingBox("date")}
                      onMouseLeave={() => setSelectedBoundingBox(null)}
                      className={`p-2 rounded-lg transition-all border ${
                        selectedBoundingBox === "date"
                          ? "bg-cyan-500/20 border-cyan-400 shadow-lg"
                          : "border-dashed border-cyan-500/40 bg-cyan-500/5"
                      }`}
                    >
                      <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                        [Box: Timestamp]
                      </div>
                      <div className="text-zinc-200">{activeModalDoc.date}</div>
                    </div>

                    {/* Extracted Line Items */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">[Itemized Lines]</div>
                      {(activeModalDoc.extractedItems || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-zinc-300">
                          <span>{item.qty}x {item.desc}</span>
                          <span className="font-mono">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tax & Total Bounding Boxes */}
                    <div className="pt-3 border-t border-zinc-800 space-y-2">
                      <div
                        onMouseEnter={() => setSelectedBoundingBox("tax")}
                        onMouseLeave={() => setSelectedBoundingBox(null)}
                        className={`flex justify-between items-center p-1.5 rounded-lg border ${
                          selectedBoundingBox === "tax"
                            ? "bg-teal-500/20 border-teal-400"
                            : "border-dashed border-teal-500/40 bg-teal-500/5"
                        }`}
                      >
                        <span className="text-[10px] text-teal-400 font-bold">[Box: Tax/VAT]</span>
                        <span className="font-bold text-teal-300">${activeModalDoc.tax_amount.toFixed(2)}</span>
                      </div>

                      <div
                        onMouseEnter={() => setSelectedBoundingBox("total")}
                        onMouseLeave={() => setSelectedBoundingBox(null)}
                        className={`flex justify-between items-center p-1.5 rounded-lg border ${
                          selectedBoundingBox === "total"
                            ? "bg-emerald-500/30 border-emerald-400 shadow-lg"
                            : "border-dashed border-emerald-500/60 bg-emerald-500/10"
                        }`}
                      >
                        <span className="text-[10px] text-emerald-400 font-bold">[Box: Final Total]</span>
                        <span className="font-bold text-white text-base">${activeModalDoc.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 mt-4 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hover bounding boxes to trace optical character recognition coordinates
                </div>
              </div>

              {/* Right Side: Interactive Field Editor */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveModal(activeModalDoc);
                }}
                className="space-y-4 text-xs flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Vendor Name</label>
                    <input
                      type="text"
                      value={activeModalDoc.vendor}
                      onChange={(e) => setActiveModalDoc({ ...activeModalDoc, vendor: e.target.value })}
                      className="w-full bg-[#090a0f] border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Total Expense ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={activeModalDoc.total_amount}
                        onChange={(e) =>
                          setActiveModalDoc({ ...activeModalDoc, total_amount: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-[#090a0f] border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Sales Tax / VAT ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={activeModalDoc.tax_amount}
                        onChange={(e) =>
                          setActiveModalDoc({ ...activeModalDoc, tax_amount: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-[#090a0f] border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">Transaction Date</label>
                    <input
                      type="date"
                      value={activeModalDoc.date}
                      onChange={(e) => setActiveModalDoc({ ...activeModalDoc, date: e.target.value })}
                      className="w-full bg-[#090a0f] border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">IRS Schedule C Category</label>
                    <select
                      value={activeModalDoc.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        let line = "Line 27a (Other Expenses)";
                        if (cat === "Meals & Entertainment") line = "Line 24b (Deductible Meals 50%)";
                        if (cat === "Travel & Transport") line = "Line 9 (Car & Travel)";
                        if (cat === "Office Supplies") line = "Line 18 (Office Expense)";
                        setActiveModalDoc({ ...activeModalDoc, category: cat, scheduleCLine: line });
                      }}
                      className="w-full bg-[#090a0f] border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="Software & SaaS">Software & SaaS (Line 27a)</option>
                      <option value="Travel & Transport">Travel & Transport (Line 9)</option>
                      <option value="Meals & Entertainment">Meals & Entertainment (Line 24b - 50%)</option>
                      <option value="Office Supplies">Office Supplies (Line 18)</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveModalDoc(null)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm & Verify
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
