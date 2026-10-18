"use client";

import React, { useState } from "react";

interface DocumentItem {
  id: string;
  filename: string;
  vendor: string;
  category: string;
  date: string;
  currency: string;
  total_amount: number;
  tax_amount: number;
  confidence: number;
  status: "processed" | "review_needed" | "processing";
}

const INITIAL_DOCS: DocumentItem[] = [
  {
    id: "doc-1",
    filename: "uber_receipt_mar26.pdf",
    vendor: "Uber Technologies",
    category: "Travel & Transport",
    date: "2026-03-24",
    currency: "USD",
    total_amount: 42.80,
    tax_amount: 3.50,
    confidence: 0.98,
    status: "processed",
  },
  {
    id: "doc-2",
    filename: "github_invoice_0426.png",
    vendor: "GitHub Inc",
    category: "Software & SaaS",
    date: "2026-04-01",
    currency: "USD",
    total_amount: 21.00,
    tax_amount: 0.00,
    confidence: 0.95,
    status: "processed",
  },
  {
    id: "doc-3",
    filename: "starbucks_client_meet.jpg",
    vendor: "Starbucks Coffee #104",
    category: "Meals & Entertainment",
    date: "2026-04-08",
    currency: "USD",
    total_amount: 18.45,
    tax_amount: 1.62,
    confidence: 0.72,
    status: "review_needed",
  },
  {
    id: "doc-4",
    filename: "aws_cloud_compute_apr.pdf",
    vendor: "Amazon Web Services",
    category: "Software & SaaS",
    date: "2026-04-03",
    currency: "USD",
    total_amount: 184.20,
    tax_amount: 14.74,
    confidence: 0.99,
    status: "processed",
  },
  {
    id: "doc-5",
    filename: "staples_office_chair.jpg",
    vendor: "Staples Supplies",
    category: "Office Equipment",
    date: "2026-03-15",
    currency: "USD",
    total_amount: 249.99,
    tax_amount: 20.00,
    confidence: 0.89,
    status: "processed",
  },
];

export default function Home() {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCS);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);

  // Stats calculation
  const totalSpend = documents.reduce((acc, d) => acc + d.total_amount, 0);
  const totalTax = documents.reduce((acc, d) => acc + d.tax_amount, 0);
  const reviewNeededCount = documents.filter((d) => d.status === "review_needed").length;
  const avgConfidence = Math.round(
    (documents.reduce((acc, d) => acc + d.confidence, 0) / documents.length) * 100
  );

  // Category breakdown
  const categoryTotals = documents.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + d.total_amount;
    return acc;
  }, {} as Record<string, number>);

  const handleSimulateUpload = (sampleName: string, vendor: string, cat: string, total: number, tax: number) => {
    setIsUploading(true);
    setTimeout(() => {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        filename: `${sampleName.toLowerCase().replace(/\s+/g, "_")}.jpg`,
        vendor: vendor,
        category: cat,
        date: new Date().toISOString().split("T")[0],
        currency: "USD",
        total_amount: total,
        tax_amount: tax,
        confidence: Math.random() > 0.25 ? 0.96 : 0.68,
        status: Math.random() > 0.25 ? "processed" : "review_needed",
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setIsUploading(false);
    }, 1200);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === editingDoc.id ? { ...editingDoc, status: "processed" } : doc))
    );
    setEditingDoc(null);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const filteredDocs = filterCategory === "All"
    ? documents
    : documents.filter((d) => d.category === filterCategory);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Privacy Callout */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-zinc-950 border border-emerald-500/20 p-6 md:p-8">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-3">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Zero-Cloud Egress Guarantee • Open-Weight AI
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Your receipts, sorted. Your data, never uploaded.
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Local vision model (<strong>Gemma 3</strong> via Ollama) extracts line items, totals, and tax classifications directly on your machine. Perfect for privacy-conscious freelancers, consultants, and agencies.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Processed */}
        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
            <span>Total Expenses</span>
            <span className="p-1.5 rounded-lg bg-zinc-800 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${totalSpend.toFixed(2)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Across {documents.length} verified receipts
          </div>
        </div>

        {/* Deductible Tax Amount */}
        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
            <span>Deductible Tax</span>
            <span className="p-1.5 rounded-lg bg-zinc-800 text-teal-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-teal-300 tracking-tight">
            ${totalTax.toFixed(2)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Claimable sales/VAT credits
          </div>
        </div>

        {/* Average AI Confidence */}
        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
            <span>Vision Accuracy</span>
            <span className="p-1.5 rounded-lg bg-zinc-800 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight flex items-baseline gap-1">
            {avgConfidence}%
            <span className="text-xs text-emerald-500 font-normal">Gemma 3:4B</span>
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Zero hallucinations on numbers
          </div>
        </div>

        {/* Review Status */}
        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
            <span>Needs Review</span>
            <span className={`p-1.5 rounded-lg ${reviewNeededCount > 0 ? "bg-amber-500/10 text-amber-400" : "bg-zinc-800 text-zinc-400"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            {reviewNeededCount}
            {reviewNeededCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Action Required
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Low confidence or missing fields
          </div>
        </div>
      </div>

      {/* Main Interactive Section: Upload & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Box (2 cols) */}
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Drop Receipt or Invoice
              </h2>
              <span className="text-xs text-zinc-400">PDF, JPG, PNG up to 25MB</span>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => handleSimulateUpload("Custom Invoice", "Acme Freelance Tool", "Software & SaaS", 59.00, 4.72)}
              className="border-2 border-dashed border-zinc-700/80 hover:border-emerald-500/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-zinc-950/40 hover:bg-zinc-900/40 group text-center"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-emerald-500/20 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-200">
                {isUploading ? (
                  <span className="flex items-center gap-2 text-emerald-400">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Extracting via Gemma 3 locally...
                  </span>
                ) : (
                  <>Drag & drop receipts or <span className="text-emerald-400 underline underline-offset-2">browse files</span></>
                )}
              </p>
              <p className="text-xs text-zinc-400 mt-1">Processed entirely in browser & local FastAPI worker</p>
            </div>
          </div>

          {/* Quick Demo Samples */}
          <div className="mt-4 pt-4 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-400 block mb-2 font-medium">Quick Demo Click-to-Extract:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSimulateUpload("WeWork Pass", "WeWork Co-Working", "Office Equipment", 45.00, 3.60)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-700/60 transition-colors"
              >
                + WeWork Day Pass ($45.00)
              </button>
              <button
                onClick={() => handleSimulateUpload("Adobe Creative", "Adobe Systems", "Software & SaaS", 54.99, 4.40)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-700/60 transition-colors"
              >
                + Adobe Creative Cloud ($54.99)
              </button>
              <button
                onClick={() => handleSimulateUpload("Airport Taxi", "Yellow Cab NY", "Travel & Transport", 68.20, 5.45)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-700/60 transition-colors"
              >
                + Airport Taxi Ride ($68.20)
              </button>
            </div>
          </div>
        </div>

        {/* Category Breakdown (1 col) */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center justify-between">
              <span>Category Deductions</span>
              <span className="text-xs font-normal text-emerald-400">Schedule C</span>
            </h2>
            <div className="space-y-4">
              {Object.entries(categoryTotals).map(([cat, amount]) => {
                const percent = Math.round((amount / totalSpend) * 100);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-zinc-300">{cat}</span>
                      <span className="text-zinc-400 font-mono">${amount.toFixed(2)} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-200">Vendor Rule Active:</span> Automatically tags recurring SaaS invoices as Tax-deductible Operations.
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div id="receipts" className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Extracted Documents</h2>
            <p className="text-xs text-zinc-400">Structured data generated by local Gemma 3 model</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Filter:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Software & SaaS">Software & SaaS</option>
              <option value="Travel & Transport">Travel & Transport</option>
              <option value="Meals & Entertainment">Meals & Entertainment</option>
              <option value="Office Equipment">Office Equipment</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-400 uppercase tracking-wider text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Document / File</th>
                <th className="py-3 px-4 font-semibold">Vendor</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-right">Tax</th>
                <th className="py-3 px-4 font-semibold text-right">Total</th>
                <th className="py-3 px-4 font-semibold text-center">Confidence</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-zinc-300">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate max-w-[160px]">{doc.filename}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-white">{doc.vendor}</td>
                  <td className="py-3.5 px-4 text-zinc-300">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 font-mono">{doc.date}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-zinc-400">${doc.tax_amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white">${doc.total_amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-full ${
                      doc.confidence >= 0.9
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}>
                      {Math.round(doc.confidence * 100)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {doc.status === "processed" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[11px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        Review
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingDoc(doc)}
                        className="text-zinc-400 hover:text-emerald-400 p-1 transition-colors"
                        title="Edit / Review"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-zinc-400 hover:text-red-400 p-1 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Review Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Verify & Edit Extraction</h3>
            <p className="text-xs text-zinc-400 mb-4">Modify model findings or assign custom tax categorization</p>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Vendor Name</label>
                <input
                  type="text"
                  value={editingDoc.vendor}
                  onChange={(e) => setEditingDoc({ ...editingDoc, vendor: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Total Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingDoc.total_amount}
                    onChange={(e) => setEditingDoc({ ...editingDoc, total_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Tax / VAT ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingDoc.tax_amount}
                    onChange={(e) => setEditingDoc({ ...editingDoc, tax_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Category</label>
                <select
                  value={editingDoc.category}
                  onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Software & SaaS">Software & SaaS</option>
                  <option value="Travel & Transport">Travel & Transport</option>
                  <option value="Meals & Entertainment">Meals & Entertainment</option>
                  <option value="Office Equipment">Office Equipment</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Save & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
