"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  IconUsers,
  IconUserCheck,
  IconUserExclamation,
  IconClock,
  IconSearch,
  IconPhone,
  IconReceipt,
  IconTrendingUp,
  IconCash,
  IconFileText,
  IconFilter,
  IconRefresh,
  IconHeadphones,
  IconSend,
  IconAlertCircle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { formatPersianCurrency, formatPersianNumber, toPersianDateTime } from "@/utils/format";
import { getCRMStats, getCRMCustomers, CRMStats, CustomerSegmentItem } from "./crm.action";
import { getAdminSupportTickets, adminReplyTicket, SupportTicketItem } from "@/app/(web)/dashboard/support/support.action";
import CustomerDossierModal from "./CustomerDossierModal";

export default function CRMPage() {
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [viewMode, setViewMode] = useState<"customers" | "support">("customers");

  // Customer segmentation states
  const [activeSegment, setActiveSegment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [customers, setCustomers] = useState<CustomerSegmentItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Support ticket states
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>([]);
  const [ticketFilter, setTicketFilter] = useState<string>("ALL");
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [replyingTicketId, setReplyingTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await getCRMStats();
      setStats(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadCustomers = useCallback(async (segment: string, search: string) => {
    setLoadingList(true);
    try {
      const res = await getCRMCustomers({ segment, search, limit: 100 });
      setCustomers(res.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadTickets = useCallback(async (status: string) => {
    setLoadingTickets(true);
    try {
      const res = await getAdminSupportTickets(status);
      setSupportTickets(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (viewMode === "customers") {
      const timer = setTimeout(() => {
        loadCustomers(activeSegment, searchQuery);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      loadTickets(ticketFilter);
    }
  }, [viewMode, activeSegment, searchQuery, ticketFilter, loadCustomers, loadTickets]);

  const handleSendReply = async (ticketId: number) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const res = await adminReplyTicket(ticketId, replyText, "ANSWERED");
      if (res.success) {
        setReplyingTicketId(null);
        setReplyText("");
        loadTickets(ticketFilter);
      } else {
        alert(res.message);
      }
    } catch {
      alert("خطا در ارسال پاسخ");
    } finally {
      setReplySubmitting(false);
    }
  };

  const getSegmentBadge = (type: string) => {
    switch (type) {
      case "loyal":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">وفادار</span>;
      case "new":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">جدید</span>;
      case "frequent":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">پرتکرار</span>;
      case "at_risk":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">در معرض ریزش</span>;
      case "inactive":
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700">غیرفعال</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-gray-800 max-w-7xl mx-auto" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <IconUsers size={28} className="text-blue-600" />
            <span>مدیریت مشتریان و CRM طِب خیّر</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            پایش هوشمند مشتریان، رسیدگی به شکایات و تیکت‌ها، پرونده خرید و بازاریابی مجدد
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Main View Switcher */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("customers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === "customers" ? "bg-white text-blue-800 shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconUsers size={15} />
              <span>مشتریان و بخش‌بندی</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("support")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === "support" ? "bg-white text-blue-800 shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconHeadphones size={15} />
              <span>تیکت‌ها و شکایات</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              loadStats();
              if (viewMode === "customers") loadCustomers(activeSegment, searchQuery);
              else loadTickets(ticketFilter);
            }}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            title="بروزرسانی داده‌ها"
          >
            <IconRefresh size={16} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Customers */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold text-gray-500">کل مشتریان</span>
            <IconUsers size={20} />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-gray-900">
            {loadingStats ? "..." : formatPersianNumber(stats?.totalCustomers || 0)}
          </strong>
          <span className="text-[11px] text-gray-400 mt-1">کاربران ثبت‌نامی</span>
        </div>

        {/* New Customers */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold text-gray-500">مشتریان جدید</span>
            <IconUserCheck size={20} />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-emerald-700">
            {loadingStats ? "..." : formatPersianNumber(stats?.newCustomersThisMonth || 0)}
          </strong>
          <span className="text-[11px] text-emerald-600 mt-1">در این ماه</span>
        </div>

        {/* Loyal */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold text-gray-500">مشتریان وفادار</span>
            <IconTrendingUp size={20} />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-purple-700">
            {loadingStats ? "..." : formatPersianNumber(stats?.loyalCustomersCount || 0)}
          </strong>
          <span className="text-[11px] text-purple-600 mt-1">بیش از ۳ خرید موفق</span>
        </div>

        {/* At Risk */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold text-gray-500">در معرض ریزش</span>
            <IconUserExclamation size={20} />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-amber-700">
            {loadingStats ? "..." : formatPersianNumber(stats?.atRiskCustomersCount || 0)}
          </strong>
          <span className="text-[11px] text-amber-600 mt-1">عدم خرید بیش از ۶۰ روز</span>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-bold text-gray-500">درآمد حاصله</span>
            <IconCash size={20} />
          </div>
          <strong className="text-base sm:text-lg font-black text-blue-800">
            {loadingStats ? "..." : formatPersianCurrency(stats?.totalRevenue || 0)}
          </strong>
          <span className="text-[11px] text-gray-400 mt-1">از سفارشات موفق</span>
        </div>

        {/* AOV */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold text-gray-500">میانگین سفارش (AOV)</span>
            <IconReceipt size={20} />
          </div>
          <strong className="text-base sm:text-lg font-black text-indigo-800">
            {loadingStats ? "..." : formatPersianCurrency(stats?.averageOrderValue || 0)}
          </strong>
          <span className="text-[11px] text-gray-400 mt-1">میانگین هر خرید</span>
        </div>

      </div>

      {viewMode === "customers" ? (
        /* Customers Segmentation & List View */
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Segment Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "همه مشتریان" },
                { id: "loyal", label: "مشتریان وفادار" },
                { id: "new", label: "مشتریان جدید" },
                { id: "frequent", label: "خریداران پرتکرار" },
                { id: "at_risk", label: "در معرض ریزش" },
                { id: "inactive", label: "مشتریان غیرفعال" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSegment(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    activeSegment === tab.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو بر اساس نام، موبایل، کدملی..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
              <IconSearch size={16} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>

          </div>

          {/* Customer Records Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3">نام و مشخصات مشتری</th>
                  <th className="py-3 px-3">شماره تماس</th>
                  <th className="py-3 px-3">تاریخ عضویت</th>
                  <th className="py-3 px-3 text-center">تعداد سفارشات</th>
                  <th className="py-3 px-3">مجموع خرید موفق</th>
                  <th className="py-3 px-3">گروه‌بندی CRM</th>
                  <th className="py-3 px-3">آخرین سفارش</th>
                  <th className="py-3 px-3 text-center">اقدامات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingList ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      در حال بارگذاری لیست مشتریان...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      هیچ کاربری با این مشخصات یا در این گروه یافت نشد.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900">{c.name}</div>
                        {c.nationalCode && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            کد ملی: {formatPersianNumber(c.nationalCode)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-gray-700">{formatPersianNumber(c.phone)}</td>

                      <td className="py-3 px-3 text-gray-500">
                        {c.date ? toPersianDateTime(c.date).split("،")[0] : "-"}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-gray-800">{formatPersianNumber(c.orderCount)}</span>
                        {c.successfulOrderCount > 0 && (
                          <span className="text-[10px] text-emerald-600 block">
                            ({formatPersianNumber(c.successfulOrderCount)} موفق)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-bold text-blue-700 font-mono">
                        {c.totalSpent > 0 ? formatPersianCurrency(c.totalSpent) : "بدون خرید"}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {c.segments.length > 0 ? (
                            c.segments.map((seg) => (
                              <span key={seg}>{getSegmentBadge(seg)}</span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-[11px]">عادی</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-gray-600">
                        {c.lastOrderDate ? toPersianDateTime(c.lastOrderDate).split("،")[0] : "-"}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomerId(c.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition"
                            title="مشاهده پرونده کامل مشتری"
                          >
                            <IconFileText size={14} />
                            <span>پرونده</span>
                          </button>
                          <a
                            href={`tel:${c.phone}`}
                            className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            title="تماس تلفنی"
                          >
                            <IconPhone size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        /* Support Tickets & Complaints Management View */
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <IconHeadphones size={20} className="text-blue-600" />
                <span>مدیریت تیکت‌ها، شکایات و سؤالات مشتریان</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">مشاهده متن درخواست‌های کاربران و پاسخ‌دهی مستقیم</p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: "ALL", label: "همه تیکت‌ها" },
                { id: "PENDING", label: "در انتظار پاسخ" },
                { id: "ANSWERED", label: "پاسخ داده شده" },
                { id: "CLOSED", label: "بسته شده" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTicketFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    ticketFilter === f.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loadingTickets ? (
            <div className="py-12 text-center text-gray-400 text-xs">در حال بارگذاری تیکت‌ها...</div>
          ) : supportTickets.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">هیچ تیکتی در این وضعیت یافت نشد.</div>
          ) : (
            <div className="space-y-3">
              {supportTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition text-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{ticket.subject}</span>
                      <span className="font-mono text-gray-400 text-[11px]">#{ticket.ticketNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {ticket.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-mono">{toPersianDateTime(ticket.created_at)}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ticket.status === "ANSWERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : ticket.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ticket.status === "ANSWERED" ? "پاسخ داده شده" : ticket.status === "PENDING" ? "در انتظار پاسخ" : ticket.status}
                      </span>
                    </div>
                  </div>

                  {/* Customer details bar */}
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200">
                    <span>مشتری: <strong className="text-gray-900">{ticket.userName || "کاربر"}</strong></span>
                    <span>شماره تماس: <strong className="font-mono text-gray-900">{ticket.userPhone || "-"}</strong></span>
                    {ticket.orderId && (
                      <span>سفارش مرتبط: <strong className="text-blue-700">#{formatPersianNumber(ticket.orderId)}</strong></span>
                    )}
                    <a
                      href={`tel:${ticket.userPhone}`}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      تماس تلفنی ↗
                    </a>
                  </div>

                  {/* Message body */}
                  <div className="p-3 bg-white rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {ticket.message}
                  </div>

                  {/* Existing Reply */}
                  {ticket.adminReply && (
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 space-y-1">
                      <div className="flex justify-between font-bold text-[11px]">
                        <span>پاسخ ارسال‌شده به کاربر:</span>
                        <span>{ticket.adminRepliedAt ? toPersianDateTime(ticket.adminRepliedAt) : ""}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed bg-white p-2.5 rounded border border-emerald-100">
                        {ticket.adminReply}
                      </p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTicketId === ticket.id ? (
                    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                      <label className="block font-bold text-gray-800 text-xs">پاسخ پشتیبانی به مشتری:</label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="متن پاسخ خود را به صورت محترمانه و دقیق یادداشت فرمایید..."
                        className="w-full p-2.5 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyingTicketId(null)}
                          className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-xs font-bold"
                        >
                          انصراف
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReply(ticket.id)}
                          disabled={replySubmitting || !replyText.trim()}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                        >
                          <IconSend size={14} />
                          <span>{replySubmitting ? "در حال ارسال..." : "ارسال پاسخ"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingTicketId(ticket.id);
                        setReplyText(ticket.adminReply || "");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200"
                    >
                      <IconSend size={13} />
                      <span>{ticket.adminReply ? "ویرایش پاسخ" : "ثبت پاسخ به تیکت"}</span>
                    </button>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Dossier Modal */}
      {selectedCustomerId && (
        <CustomerDossierModal
          userId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}

    </div>
  );
}
