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
  IconTruckDelivery,
  IconBarcode,
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconPlus,
  IconEdit,
  IconTrash,
  IconQuestionMark,
  IconShieldCheck,
  IconNote,
  IconHistory,
  IconX,
  IconArrowLeft,
  IconPackage,
  IconCalendar,
  IconAlertTriangle,
  IconUser,
  IconMapPin,
  IconListDetails,
  IconMessage,
  IconStarFilled,
  IconHome,
  IconBriefcase,
} from "@tabler/icons-react";
import { formatPersianCurrency, formatPersianNumber, toPersianDateTime } from "@/utils/format";
import { SmsManagerTab } from "@/components/admin/SmsManagerTab";
import {
  getCRMStats,
  getCRMCustomers,
  searchUnifiedCustomerAndOrder,
  addCustomerAdminNote,
  CRMStats,
  CustomerSegmentItem,
} from "./crm.action";
import {
  getAdminSupportTickets,
  addTicketMessage,
  getTicketMessages,
  getAllAdminFAQs,
  createSupportFAQ,
  updateSupportFAQ,
  deleteSupportFAQ,
  SupportTicketItem,
  SupportMessageItem,
  FAQItem,
} from "@/app/(web)/dashboard/support/support.action";
import { getCancellationReports } from "@/app/(web)/admin/orders/order.action";
import OrderStatusEnum from "@/generated/OrderStatus.enum";
import Link from "next/link";

export default function CRMPage() {
  const [viewMode, setViewMode] = useState<"unified" | "cancellations" | "support" | "faqs" | "customers" | "sms">(
    "unified"
  );

  const [stats, setStats] = useState<CRMStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Unified Search State (Requirement 5)
  const [unifiedQuery, setUnifiedQuery] = useState("");
  const [searchingUnified, setSearchingUnified] = useState(false);
  const [unifiedResult, setUnifiedResult] = useState<any | null>(null);
  const [unifiedError, setUnifiedError] = useState("");

  // New admin internal note inside unified view
  const [newAdminNote, setNewAdminNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Cancellation reporting state (Requirement 4)
  const [cancellationReports, setCancellationReports] = useState<{
    byReason: Array<{ reason: string; count: number }>;
    recent: any[];
  }>({ byReason: [], recent: [] });
  const [loadingCancellations, setLoadingCancellations] = useState(false);

  // Support ticket states (Requirement 3)
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>([]);
  const [ticketFilter, setTicketFilter] = useState<string>("ALL");
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketMessages, setTicketMessages] = useState<SupportMessageItem[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // FAQ management state (Requirement 3)
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQItem> | null>(null);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [faqFormQuestion, setFaqFormQuestion] = useState("");
  const [faqFormAnswer, setFaqFormAnswer] = useState("");
  const [faqFormCategory, setFaqFormCategory] = useState("عمومی");
  const [faqFormOrder, setFaqFormOrder] = useState<number>(0);
  const [savingFaq, setSavingFaq] = useState(false);

  // Customer segmentation states
  const [activeSegment, setActiveSegment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [customers, setCustomers] = useState<CustomerSegmentItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // Copy feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Load KPI stats
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

  // Load cancellation reports
  const loadCancellations = useCallback(async () => {
    setLoadingCancellations(true);
    try {
      const res = await getCancellationReports();
      setCancellationReports(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCancellations(false);
    }
  }, []);

  // Load support tickets
  const loadTickets = useCallback(async (status: string) => {
    setLoadingTickets(true);
    try {
      const res = await getAdminSupportTickets(status);
      setSupportTickets(res);
      if (res.length > 0 && !selectedTicketId) {
        setSelectedTicketId(res[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTickets(false);
    }
  }, [selectedTicketId]);

  // Load FAQs
  const loadFaqs = useCallback(async () => {
    setLoadingFaqs(true);
    try {
      const res = await getAllAdminFAQs();
      setFaqs(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFaqs(false);
    }
  }, []);

  // Load Customers
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

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (viewMode === "cancellations") {
      loadCancellations();
    } else if (viewMode === "support") {
      loadTickets(ticketFilter);
    } else if (viewMode === "faqs") {
      loadFaqs();
    } else if (viewMode === "customers") {
      loadCustomers(activeSegment, searchQuery);
    }
  }, [viewMode, ticketFilter, activeSegment, searchQuery, loadCancellations, loadTickets, loadFaqs, loadCustomers]);

  // Fetch ticket thread when selected ticket changes
  useEffect(() => {
    if (selectedTicketId) {
      setLoadingThread(true);
      getTicketMessages(selectedTicketId)
        .then((msgs) => setTicketMessages(msgs))
        .finally(() => setLoadingThread(false));
    }
  }, [selectedTicketId]);

  // Handle Unified Search
  const handleExecuteUnifiedSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!unifiedQuery.trim()) return;

    setSearchingUnified(true);
    setUnifiedError("");
    try {
      const res = await searchUnifiedCustomerAndOrder(unifiedQuery);
      if (res.success) {
        setUnifiedResult(res.data);
      } else {
        setUnifiedResult(null);
        setUnifiedError(res.message);
      }
    } catch {
      setUnifiedError("خطا در پردازش جستجو. لطفاً دوباره تلاش فرمایید.");
    } finally {
      setSearchingUnified(false);
    }
  };

  // Add internal note in Unified View
  const handleAddAdminNote = async () => {
    if (!unifiedResult?.user?.id || !newAdminNote.trim()) return;
    setSavingNote(true);
    try {
      const res = await addCustomerAdminNote(unifiedResult.user.id, newAdminNote);
      if (res.success) {
        const updatedNotes = [
          {
            id: Date.now(),
            userId: unifiedResult.user.id,
            adminName: "شما",
            note: newAdminNote.trim(),
            created_at: new Date().toISOString(),
          },
          ...(unifiedResult.adminNotes || []),
        ];
        setUnifiedResult({ ...unifiedResult, adminNotes: updatedNotes });
        setNewAdminNote("");
      } else {
        alert(res.message);
      }
    } catch {
      alert("خطا در ذخیره یادداشت");
    } finally {
      setSavingNote(false);
    }
  };

  // Send admin reply to ticket
  const handleSendAdminReply = async () => {
    if (!selectedTicketId || !adminReplyText.trim()) return;
    setReplySubmitting(true);
    try {
      const res = await addTicketMessage(selectedTicketId, adminReplyText);
      if (res.success) {
        setAdminReplyText("");
        const updatedMsgs = await getTicketMessages(selectedTicketId);
        setTicketMessages(updatedMsgs);
        loadTickets(ticketFilter);
      } else {
        alert(res.message);
      }
    } catch {
      alert("خطا در ارسال پاسخ تیکت");
    } finally {
      setReplySubmitting(false);
    }
  };

  // Save FAQ (Create or Update)
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqFormQuestion.trim() || !faqFormAnswer.trim()) {
      alert("پرسش و پاسخ الزامی هستند.");
      return;
    }

    setSavingFaq(true);
    try {
      if (editingFaq?.id) {
        const res = await updateSupportFAQ(editingFaq.id, {
          question: faqFormQuestion,
          answer: faqFormAnswer,
          category: faqFormCategory,
          sortOrder: faqFormOrder,
        });
        if (res.success) {
          setShowFaqModal(false);
          loadFaqs();
        } else alert(res.message);
      } else {
        const res = await createSupportFAQ({
          question: faqFormQuestion,
          answer: faqFormAnswer,
          category: faqFormCategory,
          sortOrder: faqFormOrder,
        });
        if (res.success) {
          setShowFaqModal(false);
          loadFaqs();
        } else alert(res.message);
      }
    } catch {
      alert("خطا در ذخیره پرسش متداول");
    } finally {
      setSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!confirm("آیا از حذف این پرسش متداول اطمینان دارید؟")) return;
    try {
      const res = await deleteSupportFAQ(id);
      if (res.success) loadFaqs();
      else alert(res.message);
    } catch {
      alert("خطا در حذف");
    }
  };

  const openNewFaqModal = () => {
    setEditingFaq(null);
    setFaqFormQuestion("");
    setFaqFormAnswer("");
    setFaqFormCategory("عمومی");
    setFaqFormOrder(faqs.length + 1);
    setShowFaqModal(true);
  };

  const openEditFaqModal = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFaqFormQuestion(faq.question);
    setFaqFormAnswer(faq.answer);
    setFaqFormCategory(faq.category);
    setFaqFormOrder(faq.sortOrder);
    setShowFaqModal(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2.5">
            <IconUsers size={28} className="text-blue-600" />
            <span>سامانه جامع مدیریت ارتباط با مشتریان (CRM)</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            داشبورد ۳۶۰ درجه مشتری و سفارش، گزارش‌گیری علل لغو، پشتیبانی مشتریان و مدیریت FAQ
          </p>
        </div>

        {/* Top Metric Strip */}
        {stats && (
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-200 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px]">کل مشتریان</span>
              <strong className="text-gray-800 font-bold">{formatPersianNumber(stats.totalCustomers)}</strong>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <span className="text-emerald-500 block text-[10px]">مجموع فروش</span>
              <strong className="text-emerald-700 font-bold">{formatPersianCurrency(stats.totalRevenue)}</strong>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <span className="text-amber-500 block text-[10px]">سفارشات جاری</span>
              <strong className="text-amber-700 font-bold">{formatPersianNumber(stats.pendingOrdersCount)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={() => setViewMode("unified")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
            viewMode === "unified"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <IconSearch size={18} />
          <span>داشبورد ۳۶۰ درجه مشتری و سفارش</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("cancellations")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
            viewMode === "cancellations"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <IconAlertTriangle size={18} />
          <span>گزارش علل لغو سفارشات</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("support")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
            viewMode === "support"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <IconHeadphones size={18} />
          <span>درخواست‌ها و مکاتبات پشتیبانی</span>
          {supportTickets.length > 0 && (
            <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-bold">
              {formatPersianNumber(supportTickets.length)}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setViewMode("faqs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
            viewMode === "faqs"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <IconQuestionMark size={18} />
          <span>مدیریت سؤالات متداول (FAQ)</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("customers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
            viewMode === "customers"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <IconUsers size={18} />
          <span>دسته‌بندی و سگمنت مشتریان</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("sms")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
            viewMode === "sms"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <IconMessage size={18} />
          <span>پیامک و یادآوری خرید ناتمام</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. UNIFIED 360-DEGREE CUSTOMER & ORDER DASHBOARD (REQUIREMENT 5) */}
      {/* ============================================================== */}
      {viewMode === "unified" && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <div className="max-w-2xl">
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <IconSearch size={20} className="text-blue-600" />
                <span>جستجوی هوشمند مشتری و سفارش</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                کافیست شماره همراه مشتری (مثال: ۰۹۱۲۱۲۳۴۵۶۷) یا شماره سفارش (مثال: ۱۲۳۴۵) را وارد کنید تا پرونده یکپارچه ۳۶۰ درجه شامل مشخصات، کلیه سفارش‌ها، پیگیری پستی، تیکت‌ها، علل لغو و یادداشت‌های داخلی نمایش داده شود.
              </p>
            </div>

            <form onSubmit={handleExecuteUnifiedSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={unifiedQuery}
                  onChange={(e) => setUnifiedQuery(e.target.value)}
                  placeholder="شماره همراه مشتری (09xxxxxxxxx) یا شماره سفارش (#12345)..."
                  className="w-full p-3.5 pr-11 rounded-2xl border border-gray-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs font-mono"
                />
                <IconSearch size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="submit"
                disabled={searchingUnified || !unifiedQuery.trim()}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
              >
                {searchingUnified ? (
                  <span>در حال جستجو...</span>
                ) : (
                  <>
                    <IconSearch size={18} />
                    <span>جستجوی پرونده</span>
                  </>
                )}
              </button>
            </form>

            {unifiedError && (
              <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                {unifiedError}
              </div>
            )}
          </div>

          {/* Dossier Result View */}
          {unifiedResult && (
            <div className="space-y-6">
              {/* Profile Card & Lifetime Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Customer Profile Box */}
                <div className="md:col-span-2 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-5 rounded-3xl border border-blue-100 shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md shadow-blue-500/20">
                        {unifiedResult.user.name?.[0] || "ک"}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-gray-900">{unifiedResult.user.name}</h3>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                            {unifiedResult.user.role === "ADMIN" ? "مدیر سیستم" : "مشتری فروشگاه"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="font-mono dir-ltr font-bold text-blue-700">{unifiedResult.user.phone}</span>
                          {unifiedResult.user.nationalCode && (
                            <span className="text-gray-400">| کد ملی: {unifiedResult.user.nationalCode}</span>
                          )}
                        </p>
                        {unifiedResult.lastLogin && (
                          <p className="text-[11px] text-blue-800 bg-white/80 px-2.5 py-1 rounded-xl border border-blue-100 inline-block font-mono">
                            آخرین ورود موفق: {toPersianDateTime(unifiedResult.lastLogin.created_at)} ({unifiedResult.lastLogin.userAgent?.includes("Mobile") ? "موبایل" : "رایانه"})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${unifiedResult.user.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <IconPhone size={14} />
                        <span>تماس</span>
                      </a>
                      <a
                        href={`sms:${unifiedResult.user.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <span>ارسال پیامک</span>
                      </a>
                    </div>
                  </div>

                  {/* Registered Addresses Summary Badge */}
                  <div className="pt-3 border-t border-blue-100 flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium flex items-center gap-1.5">
                      <IconMapPin size={16} className="text-blue-600" />
                      <span>آدرس‌های ثبت‌شده:</span>
                    </span>
                    <span className="font-bold text-blue-900 bg-white/80 px-2.5 py-1 rounded-xl border border-blue-200">
                      {unifiedResult.addresses?.length > 0
                        ? `${formatPersianNumber(unifiedResult.addresses.length)} آدرس فعال`
                        : "فاقد آدرس ثبت‌شده"}
                    </span>
                  </div>
                </div>

                {/* Metrics Card */}
                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs flex flex-col justify-between space-y-3">
                  <span className="text-xs text-gray-500 font-bold">خلاصه عملکرد مالی مشتری</span>
                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-400 block">ارزش کل خریدهای موفق</span>
                    <strong className="text-2xl font-black text-blue-700 font-mono block">
                      {formatPersianCurrency(unifiedResult.metrics?.totalSuccessfulSpent || 0)}
                    </strong>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-2xl text-center text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">کل سفارشات</span>
                      <strong className="text-gray-800 font-bold">
                        {formatPersianNumber(unifiedResult.metrics?.totalOrders || 0)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-emerald-600 block text-[10px]">موفق</span>
                      <strong className="text-emerald-700 font-bold">
                        {formatPersianNumber(unifiedResult.metrics?.successfulOrders || 0)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-red-500 block text-[10px]">لغو شده</span>
                      <strong className="text-red-700 font-bold">
                        {formatPersianNumber(unifiedResult.metrics?.canceledOrders || 0)}
                      </strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-500 flex items-center justify-between">
                    <span>تاریخ عضویت:</span>
                    <span className="font-mono">{toPersianDateTime(unifiedResult.user.date).split("،")[0]}</span>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* DEDICATED CUSTOMER ADDRESSES & ORDER SNAPSHOTS (REQ 4,5,6,8) */}
              {/* ========================================================= */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                      <IconMapPin size={22} className="text-blue-600" />
                      <span>آدرس‌های مشتری و نشانی‌های تحویل کالا</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200">
                        {formatPersianNumber(unifiedResult.addresses?.length || 0)} آدرس ثبت‌شده
                      </span>
                      {unifiedResult.orderAddresses?.length > 0 && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 font-bold border border-purple-200">
                          {formatPersianNumber(unifiedResult.orderAddresses.length)} نشانی در فاکتور سفارش‌ها
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    نمایش کامل تمام آدرس‌های ثبت‌شده مشتری بر اساس شناسه معتبر دیتابیس ({unifiedResult.user.id})، تفکیک آدرس‌های فعال و آرشیو تحویل سفارش‌ها.
                  </p>
                </div>

                {/* 1. Active Registered Addresses */}
                <div className="space-y-3">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <IconHome size={16} className="text-blue-600" />
                    <span>آدرس‌های فعال ثبت‌شده در حساب کاربری ({formatPersianNumber(unifiedResult.addresses?.length || 0)}):</span>
                  </h4>

                  {!unifiedResult.addresses || unifiedResult.addresses.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-300 text-center space-y-1.5">
                      <IconMapPin size={32} className="text-gray-400 mx-auto" />
                      <p className="text-xs sm:text-sm font-bold text-gray-700">آدرسی برای این مشتری ثبت نشده است</p>
                      <p className="text-xs text-gray-400">این مشتری هنوز هیچ آدرسی را در حساب کاربری خود ثبت نکرده است.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {unifiedResult.addresses.map((addr: any) => (
                        <div
                          key={addr.id}
                          className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2.5 relative transition ${
                            addr.isDefault
                              ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300/40 shadow-xs"
                              : "bg-gray-50/70 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {/* Header of address card */}
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-black/5">
                            <div className="flex items-center gap-1.5 font-bold text-gray-900">
                              {addr.title === "محل کار" ? (
                                <IconBriefcase size={16} className="text-blue-600" />
                              ) : (
                                <IconHome size={16} className="text-blue-600" />
                              )}
                              <span>عنوان: {addr.title || "منزل"}</span>
                            </div>

                            {addr.isDefault && (
                              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold shadow-xs">
                                <IconStarFilled size={12} />
                                <span>آدرس پیش‌فرض تحویل</span>
                              </span>
                            )}
                          </div>

                          {/* Recipient & Contact */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500 block text-[11px]">نام گیرنده:</span>
                              <strong className="text-gray-900 font-bold">{addr.name}</strong>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[11px]">شماره تماس گیرنده:</span>
                              <a
                                href={`tel:${addr.phone}`}
                                className="font-mono dir-ltr text-blue-700 hover:underline font-bold inline-flex items-center gap-1"
                              >
                                <IconPhone size={12} />
                                <span>{addr.phone}</span>
                              </a>
                            </div>
                          </div>

                          {/* Province & City */}
                          <div className="text-xs">
                            <span className="text-gray-500 text-[11px]">استان و شهر: </span>
                            <span className="font-bold text-gray-800">{addr.state} - {addr.city}</span>
                          </div>

                          {/* Full Address */}
                          <div className="text-xs bg-white/80 p-2.5 rounded-xl border border-gray-200/80 leading-relaxed">
                            <span className="text-gray-500 text-[11px] block mb-0.5">آدرس کامل:</span>
                            <p className="text-gray-800 font-medium">{addr.address}</p>
                          </div>

                          {/* Postal Code & Date */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-gray-500">
                            <div>
                              <span className="text-gray-400">کد پستی ۱۰ رقمی: </span>
                              <strong className="font-mono text-gray-800 font-bold tracking-wider">
                                {addr.zipcode ? formatPersianNumber(addr.zipcode) : "ثبت نشده"}
                              </strong>
                            </div>
                            {addr.created_at && (
                              <span className="text-gray-400 font-mono">
                                تاریخ ثبت: {toPersianDateTime(addr.created_at).split("،")[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Historical Order Delivery Addresses (Requirement 8) */}
                {unifiedResult.orderAddresses?.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
                        <IconHistory size={16} className="text-purple-600" />
                        <span>تاریخچه آدرس‌های ثبت‌شده در فاکتور سفارش‌ها ({formatPersianNumber(unifiedResult.orderAddresses.length)}):</span>
                      </h4>
                      <span className="text-[11px] text-gray-400">آرشیو فاکتورها (مستقل از آدرس‌های فعال)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {unifiedResult.orderAddresses.map((ordAddr: any, idx: number) => (
                        <div key={idx} className="p-3 bg-purple-50/40 rounded-2xl border border-purple-100 space-y-1.5">
                          <div className="flex items-center justify-between gap-1 pb-1 border-b border-purple-100/60">
                            <span className="font-bold text-purple-950 font-mono">
                              فاکتور سفارش #{formatPersianNumber(ordAddr.orderId)}
                            </span>
                            <span className="text-[10px] font-mono text-purple-700">
                              {toPersianDateTime(ordAddr.orderDate).split("،")[0]}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-700">
                            <strong>گیرنده: </strong>
                            <span>{ordAddr.name} ({ordAddr.phone})</span>
                          </div>
                          <div className="text-[11px] text-gray-700">
                            <strong>مقصد: </strong>
                            <span>{ordAddr.state}، {ordAddr.city}</span>
                          </div>
                          <p className="text-gray-800 bg-white/70 p-2 rounded-lg border border-purple-100 text-[11px] leading-relaxed">
                            {ordAddr.address}
                          </p>
                          {ordAddr.zipcode && (
                            <p className="text-[10px] text-gray-500 font-mono">
                              کد پستی زمان ثبت: {formatPersianNumber(ordAddr.zipcode)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Order History with Payment & Postal Tracking */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <IconPackage size={20} className="text-blue-600" />
                    <span>سوابق کامل سفارش‌ها، پرداخت و ارسال پستی ({formatPersianNumber(unifiedResult.orders?.length || 0)})</span>
                  </h3>
                </div>

                {unifiedResult.orders?.length === 0 ? (
                  <p className="py-6 text-center text-xs text-gray-400">سفارشی ثبت نشده است.</p>
                ) : (
                  <div className="space-y-3">
                    {unifiedResult.orders.map((ord: any) => {
                      const tracking = ord.trackingCode;
                      const isCanceled = ord.status === "CANCELED";
                      const cancellation = unifiedResult.cancellations?.find((c: any) => c.orderId === ord.id);

                      return (
                        <div
                          key={ord.id}
                          className={`p-4 rounded-2xl border text-xs sm:text-sm transition ${
                            isCanceled
                              ? "bg-red-50/40 border-red-200"
                              : ord.status === "SENDED"
                              ? "bg-blue-50/30 border-blue-200"
                              : "bg-gray-50/70 border-gray-200"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/5">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-bold font-mono text-gray-900 text-sm">
                                سفارش #{formatPersianNumber(ord.id)}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  isCanceled
                                    ? "bg-red-100 text-red-800"
                                    : ord.status === "SENDED"
                                    ? "bg-blue-100 text-blue-800"
                                    : ord.status === "DELAY"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {OrderStatusEnum[ord.status as keyof typeof OrderStatusEnum] || ord.status}
                              </span>
                              <span className="text-gray-400 text-xs font-mono">{toPersianDateTime(ord.created_at)}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-500">مبلغ:</span>
                              <span className="font-black text-blue-700 font-mono text-sm">
                                {formatPersianCurrency(ord.payment?.amount || 0)}
                              </span>
                            </div>
                          </div>

                          {/* Cancellation Note if canceled */}
                          {isCanceled && (cancellation || ord.info?.cancellationReason) && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-red-100/70 text-red-900 border border-red-200 text-xs flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <strong>علت لغو سفارش: </strong>
                                <span>{cancellation?.reason || ord.info?.cancellationReason}</span>
                                {(cancellation?.note || ord.info?.cancellationNote) && (
                                  <span className="mr-2 text-red-800">
                                    (توضیح: {cancellation?.note || ord.info?.cancellationNote})
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-red-700">ثبت‌شده توسط: {cancellation?.canceledBy || "مدیریت"}</span>
                            </div>
                          )}

                          {/* Postal Tracking Strip */}
                          {tracking ? (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-blue-100/60 text-blue-900 border border-blue-200 text-xs flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <IconBarcode size={18} className="text-blue-700" />
                                <span>کد رهگیری مرسوله پستی: </span>
                                <strong className="font-mono text-blue-950 font-bold">{tracking}</strong>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(tracking)}
                                  className="text-gray-500 hover:text-blue-700 p-0.5"
                                  title="کپی کد رهگیری"
                                >
                                  {copiedText === tracking ? (
                                    <IconCheck size={14} className="text-emerald-600" />
                                  ) : (
                                    <IconCopy size={14} />
                                  )}
                                </button>
                              </div>
                              <a
                                href={`https://tracking.post.ir/?id=${tracking}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition flex items-center gap-1"
                              >
                                <span>پیگیری در سامانه پست</span>
                                <IconExternalLink size={12} />
                              </a>
                            </div>
                          ) : ord.status === "SENDED" ? (
                            <div className="mt-2 text-xs text-blue-600 font-bold">
                              تحویل پست شده و کد به زودی درج خواهد شد.
                            </div>
                          ) : null}

                          {/* Products breakdown */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {ord.products.map((p: any) => (
                              <div
                                key={p.id}
                                className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs flex items-center gap-1.5"
                              >
                                <span>{p.productName}</span>
                                <span className="text-gray-400">×</span>
                                <strong className="text-blue-600">{formatPersianNumber(p.count)}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Support Tickets & Messages & Admin Internal Notes (Two Columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Support Tickets Column */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                      <IconHeadphones size={20} className="text-blue-600" />
                      <span>درخواست‌های پشتیبانی ({formatPersianNumber(unifiedResult.tickets?.length || 0)})</span>
                    </h3>
                  </div>

                  {unifiedResult.tickets?.length === 0 ? (
                    <p className="py-6 text-center text-xs text-gray-400">تیکت پشتیبانی ثبت نشده است.</p>
                  ) : (
                    <div className="space-y-3">
                      {unifiedResult.tickets.map((t: any) => (
                        <div key={t.id} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">{t.subject}</span>
                            <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                              #{t.ticketNumber}
                            </span>
                          </div>
                          <p className="text-gray-600 line-clamp-2">{t.message}</p>
                          {t.adminReply && (
                            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                              <strong>پاسخ مدیریت: </strong>
                              <span>{t.adminReply}</span>
                            </div>
                          )}
                          <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
                            <span>وضعیت: {t.status === "ANSWERED" ? "پاسخ داده شده" : t.status === "CLOSED" ? "بسته شده" : "در انتظار"}</span>
                            <span>{toPersianDateTime(t.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Internal Admin Notes Column */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                        <IconNote size={20} className="text-amber-600" />
                        <span>یادداشت‌های محرمانه داخلی مدیریت ({formatPersianNumber(unifiedResult.adminNotes?.length || 0)})</span>
                      </h3>
                    </div>

                    {unifiedResult.adminNotes?.length === 0 ? (
                      <p className="py-4 text-center text-xs text-gray-400">
                        هنوز یادداشت داخلی برای این مشتری ثبت نشده است.
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto">
                        {unifiedResult.adminNotes.map((note: any) => (
                          <div key={note.id} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                            <div className="flex items-center justify-between text-amber-900 font-bold text-[11px]">
                              <span>ثبت‌شده توسط {note.adminName}</span>
                              <span className="text-gray-400 font-normal">{toPersianDateTime(note.created_at)}</span>
                            </div>
                            <p className="text-gray-800 leading-relaxed">{note.note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Note Box */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <label className="block text-xs font-bold text-gray-700">افزودن یادداشت جدید روی پرونده مشتری:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAdminNote}
                        onChange={(e) => setNewAdminNote(e.target.value)}
                        placeholder="نکات خاص مشتری، ترجیحات ارسال، مکالمات تلفنی..."
                        className="flex-1 p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <button
                        type="button"
                        disabled={savingNote || !newAdminNote.trim()}
                        onClick={handleAddAdminNote}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition disabled:opacity-50"
                      >
                        {savingNote ? "ذخیره..." : "ثبت یادداشت"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity & Change History Log */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-3">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                  <IconHistory size={20} className="text-blue-600" />
                  <span>آخرین اقدامات، تغییرات و سوابق رفتاری مشتری ({formatPersianNumber(unifiedResult.activityLogs?.length || 0)})</span>
                </h3>

                {unifiedResult.activityLogs?.length === 0 ? (
                  <p className="py-4 text-center text-xs text-gray-400">سابقه‌ای ثبت نشده است.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {unifiedResult.activityLogs.map((log: any) => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-2">
                        <div>
                          <strong className="text-gray-800 font-bold">{log.action}: </strong>
                          <span className="text-gray-600">{log.details}</span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono flex-shrink-0">{toPersianDateTime(log.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ORDER CANCELLATIONS & REASONS REPORTING (REQUIREMENT 4)     */}
      {/* ============================================================== */}
      {viewMode === "cancellations" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <IconAlertTriangle size={22} className="text-red-600" />
                <span>گزارش جامع علل لغو سفارشات و مرجوعی‌ها</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                تفکیک آماری و تحلیلی دلایل لغو سفارش‌ها بر اساس دسته‌بندی‌های اولیه جهت بهبود فرآیند تأمین کالا و ارسال
              </p>
            </div>

            {/* Reason Counts Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { reason: "تغییر نظر مشتری", color: "from-blue-500 to-indigo-600" },
                { reason: "تأخیر در ارسال", color: "from-amber-500 to-orange-600" },
                { reason: "ناموجودشدن کالا", color: "from-rose-500 to-red-600" },
                { reason: "مشکل پرداخت", color: "from-purple-500 to-violet-600" },
                { reason: "ثبت اشتباه سفارش", color: "from-teal-500 to-emerald-600" },
                { reason: "سایر موارد", color: "from-slate-600 to-gray-700" },
              ].map((cat) => {
                const item = cancellationReports.byReason?.find((r) => r.reason === cat.reason);
                const count = item ? item.count : 0;
                return (
                  <div
                    key={cat.reason}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1 text-center hover:border-gray-300 transition"
                  >
                    <span className="text-[11px] text-gray-600 block font-bold truncate">{cat.reason}</span>
                    <strong className="text-2xl font-black text-gray-900 font-mono block">
                      {formatPersianNumber(count)}
                    </strong>
                    <span className="text-[10px] text-gray-400">سفارش</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Table of Canceled Orders */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <h3 className="text-sm sm:text-base font-black text-gray-900">
              لیست سفارش‌های لغو شده به همراه توضیحات تکمیلی
            </h3>

            {loadingCancellations ? (
              <p className="py-8 text-center text-xs text-gray-400">در حال دریافت اطلاعات...</p>
            ) : cancellationReports.recent?.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">سفارش لغو شده‌ای ثبت نشده است.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="p-3">شماره سفارش</th>
                      <th className="p-3">مشتری</th>
                      <th className="p-3">علت لغو سفارش</th>
                      <th className="p-3">توضیح تکمیلی مدیریت</th>
                      <th className="p-3">لغوکننده</th>
                      <th className="p-3">تاریخ لغو</th>
                      <th className="p-3 text-center">پرونده مشتری</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cancellationReports.recent.map((c: any) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition">
                        <td className="p-3 font-mono font-bold text-gray-900">#{c.orderId}</td>
                        <td className="p-3 font-bold text-gray-800">
                          {c.userName || "کاربر"} ({c.userPhone ? `0${c.userPhone}` : "-"})
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-[11px]">
                            {c.reason}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 max-w-xs">{c.note || "فاقد توضیح تکمیلی"}</td>
                        <td className="p-3 text-gray-500">{c.canceledBy || "مدیریت"}</td>
                        <td className="p-3 font-mono text-gray-400">{toPersianDateTime(c.created_at)}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setViewMode("unified");
                              setUnifiedQuery(String(c.orderId));
                              searchUnifiedCustomerAndOrder(String(c.orderId)).then((res) => {
                                if (res.success) setUnifiedResult(res.data);
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                          >
                            مشاهده ۳۶۰°
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SUPPORT TICKETS & MULTI-MESSAGE THREADS (REQUIREMENT 3)     */}
      {/* ============================================================== */}
      {viewMode === "support" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List Column */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <IconHeadphones size={20} className="text-blue-600" />
                  <span>تیکت‌های مشتریان</span>
                </h3>
                <select
                  value={ticketFilter}
                  onChange={(e) => setTicketFilter(e.target.value)}
                  className="p-1.5 rounded-xl border border-gray-300 text-xs bg-white font-bold"
                >
                  <option value="ALL">همه وضعیت‌ها</option>
                  <option value="PENDING">در انتظار بررسی</option>
                  <option value="ANSWERED">پاسخ داده شده</option>
                  <option value="CLOSED">بسته شده</option>
                </select>
              </div>

              {loadingTickets ? (
                <p className="py-8 text-center text-xs text-gray-400">در حال دریافت تیکت‌ها...</p>
              ) : supportTickets.length === 0 ? (
                <p className="py-8 text-center text-xs text-gray-400">تیکتی با این وضعیت یافت نشد.</p>
              ) : (
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
                  {supportTickets.map((t) => {
                    const isSelected = selectedTicketId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicketId(t.id)}
                        className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition ${
                          isSelected
                            ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-100"
                            : "bg-gray-50/70 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-bold text-gray-900 truncate">{t.subject}</span>
                          <span className="font-mono text-blue-700 font-bold bg-blue-100/70 px-1.5 py-0.5 rounded text-[10px]">
                            {t.ticketNumber}
                          </span>
                        </div>
                        <p className="text-gray-500 line-clamp-1">{t.message}</p>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-black/5 mt-2">
                          <span className="font-bold text-gray-700">{t.userName || "کاربر"}</span>
                          <span>{toPersianDateTime(t.created_at).split("،")[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Conversation Thread & Reply Column */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4 flex flex-col justify-between">
              {selectedTicketId ? (
                (() => {
                  const currentTicket = supportTickets.find((t) => t.id === selectedTicketId);
                  return (
                    <div className="space-y-4 flex flex-col h-full justify-between">
                      <div className="space-y-3">
                        {/* Thread Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-gray-900 text-base">{currentTicket?.subject}</h3>
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 font-mono">
                                #{currentTicket?.ticketNumber}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              مشتری: <strong className="text-gray-800">{currentTicket?.userName}</strong> (تلفن: {currentTicket?.userPhone})
                              {currentTicket?.orderId && (
                                <span className="mr-2 text-amber-700 font-bold">
                                  | متصل به سفارش #{currentTicket.orderId}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                              {currentTicket?.status === "ANSWERED"
                                ? "پاسخ داده شده"
                                : currentTicket?.status === "CLOSED"
                                ? "بسته شده"
                                : "در انتظار بررسی"}
                            </span>
                          </div>
                        </div>

                        {/* Messages Area */}
                        <div className="space-y-3 max-h-[380px] overflow-y-auto p-2">
                          {loadingThread ? (
                            <p className="py-6 text-center text-xs text-gray-400">در حال دریافت مکاتبات...</p>
                          ) : ticketMessages.length === 0 ? (
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
                              {currentTicket?.message}
                            </div>
                          ) : (
                            ticketMessages.map((msg) => {
                              const isAdmin = msg.senderRole === "ADMIN";
                              return (
                                <div
                                  key={msg.id}
                                  className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-1.5 ${
                                    isAdmin
                                      ? "bg-blue-600 text-white border-blue-700 ml-4 sm:ml-12"
                                      : "bg-gray-100 text-gray-900 border-gray-200 mr-4 sm:mr-12"
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-[11px] opacity-80 border-b pb-1 border-white/20">
                                    <span className="font-bold">{isAdmin ? "پاسخ مدیریت" : msg.senderName || "مشتری"}</span>
                                    <span className="font-mono">{toPersianDateTime(msg.created_at)}</span>
                                  </div>
                                  <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Reply Form */}
                      <div className="pt-3 border-t border-gray-100 space-y-2">
                        <label className="block text-xs font-bold text-gray-700">
                          ثبت پاسخ جدید و اطلاع‌رسانی خودکار به مشتری:
                        </label>
                        <div className="flex gap-2">
                          <textarea
                            rows={2}
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                            placeholder="متن پاسخ مدیریت به مشتری..."
                            className="flex-1 p-3 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                          <button
                            type="button"
                            disabled={replySubmitting || !adminReplyText.trim()}
                            onClick={handleSendAdminReply}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <IconSend size={16} />
                            <span>{replySubmitting ? "ارسال..." : "ارسال پاسخ"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="py-20 text-center text-xs text-gray-400">یک تیکت را از لیست انتخاب فرمایید.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. FAQ MANAGEMENT (REQUIREMENT 3)                              */}
      {/* ============================================================== */}
      {viewMode === "faqs" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                  <IconQuestionMark size={22} className="text-blue-600" />
                  <span>مدیریت پرسش‌های متداول مشتریان (FAQ)</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  افزودن، ویرایش و حذف پرسش‌های پرتکرار که در بخش پشتیبانی حساب مشتریان نمایش داده می‌شوند.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewFaqModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition shadow-xs"
              >
                <IconPlus size={16} />
                <span>افزودن پرسش جدید</span>
              </button>
            </div>

            {loadingFaqs ? (
              <p className="py-8 text-center text-xs text-gray-400">در حال دریافت لیست سؤالات...</p>
            ) : faqs.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">هیچ پرسش متداولی ثبت نشده است.</p>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm space-y-2 hover:border-gray-300 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            ؟
                          </span>
                          <h4 className="font-bold text-gray-900">{faq.question}</h4>
                        </div>
                        <span className="text-[11px] text-gray-500 bg-gray-200/70 px-2 py-0.5 rounded inline-block">
                          دسته‌بندی: {faq.category} | ترتیب: {faq.sortOrder}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditFaqModal(faq)}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 transition"
                          title="ویرایش"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="p-1.5 rounded-lg bg-white border border-gray-200 text-red-600 hover:bg-red-50 transition"
                          title="حذف"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed pr-7">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. CUSTOMER SEGMENTS VIEW                                      */}
      {/* ============================================================== */}
      {viewMode === "customers" && (
        <div className="space-y-6">
          {/* Segment Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "همه مشتریان" },
              { id: "loyal", label: "مشتریان وفادار (خرید بالا)" },
              { id: "frequent", label: "مشتریان پرتکرار" },
              { id: "new", label: "مشتریان جدید" },
              { id: "at_risk", label: "در معرض ریزش" },
              { id: "inactive", label: "غیرفعال" },
            ].map((seg) => (
              <button
                key={seg.id}
                type="button"
                onClick={() => setActiveSegment(seg.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeSegment === seg.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {seg.label}
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900">لیست مشتریان ({formatPersianNumber(customers.length)})</h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو بر اساس نام یا شماره همراه..."
                className="p-2 rounded-xl border border-gray-300 text-xs w-64 bg-white"
              />
            </div>

            {loadingList ? (
              <p className="py-8 text-center text-xs text-gray-400">در حال دریافت اطلاعات مشتریان...</p>
            ) : customers.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">مشتری با این فیلتر یافت نشد.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="p-3">نام مشتری</th>
                      <th className="p-3">شماره همراه</th>
                      <th className="p-3">تعداد سفارشات</th>
                      <th className="p-3">مجموع خرید</th>
                      <th className="p-3">سگمنت</th>
                      <th className="p-3">آخرین خرید</th>
                      <th className="p-3 text-center">پرونده ۳۶۰°</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition">
                        <td className="p-3 font-bold text-gray-900">{c.name}</td>
                        <td className="p-3 font-mono dir-ltr">{c.phone}</td>
                        <td className="p-3 font-mono font-bold">{formatPersianNumber(c.orderCount)}</td>
                        <td className="p-3 font-mono font-black text-blue-700">
                          {formatPersianCurrency(c.totalSpent)}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {c.segments.map((s) => (
                              <span
                                key={s}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  s === "loyal"
                                    ? "bg-purple-100 text-purple-800"
                                    : s === "frequent"
                                    ? "bg-blue-100 text-blue-800"
                                    : s === "new"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : s === "at_risk"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {s === "loyal" ? "وفادار" : s === "frequent" ? "پرتکرار" : s === "new" ? "جدید" : s === "at_risk" ? "ریزش" : "غیرفعال"}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-gray-400">
                          {c.lastOrderDate ? toPersianDateTime(c.lastOrderDate).split("،")[0] : "-"}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setViewMode("unified");
                              setUnifiedQuery(c.id);
                              searchUnifiedCustomerAndOrder(c.id).then((res) => {
                                if (res.success) setUnifiedResult(res.data);
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                          >
                            مشاهده ۳۶۰°
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SMS WEB SERVICE & ABANDONED ORDER REMINDERS (REQUIREMENT 1) */}
      {/* ============================================================== */}
      {viewMode === "sms" && <SmsManagerTab />}

      {/* FAQ ADD / EDIT MODAL */}
      {showFaqModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowFaqModal(false);
          }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-gray-900 text-base">
                {editingFaq?.id ? "ویرایش پرسش متداول" : "افزودن پرسش متداول جدید"}
              </h3>
              <button
                type="button"
                onClick={() => setShowFaqModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">پرسش:</label>
                <input
                  type="text"
                  required
                  value={faqFormQuestion}
                  onChange={(e) => setFaqFormQuestion(e.target.value)}
                  placeholder="مثال: هزینه ارسال سفارشات چقدر است؟"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">پاسخ کامل:</label>
                <textarea
                  rows={4}
                  required
                  value={faqFormAnswer}
                  onChange={(e) => setFaqFormAnswer(e.target.value)}
                  placeholder="پاسخ تفصیلی برای راهنمایی مشتری..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">دسته‌بندی:</label>
                  <select
                    value={faqFormCategory}
                    onChange={(e) => setFaqFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white"
                  >
                    <option value="سفارش و ارسال">سفارش و ارسال</option>
                    <option value="پیگیری سفارش">پیگیری سفارش</option>
                    <option value="پشتیبانی و مرجوعی">پشتیبانی و مرجوعی</option>
                    <option value="پرداخت و فاکتور">پرداخت و فاکتور</option>
                    <option value="عمومی">عمومی</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-700">ترتیب نمایش:</label>
                  <input
                    type="number"
                    value={faqFormOrder}
                    onChange={(e) => setFaqFormOrder(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={savingFaq}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  {savingFaq ? "در حال ذخیره..." : "ذخیره پرسش"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
