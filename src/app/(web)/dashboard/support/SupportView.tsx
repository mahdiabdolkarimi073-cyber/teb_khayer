"use client";

import React, { useState, useEffect } from "react";
import {
  IconHeadphones,
  IconPlus,
  IconMessageCircle,
  IconClock,
  IconCircleCheck,
  IconAlertCircle,
  IconHelpCircle,
  IconChevronDown,
  IconChevronUp,
  IconSend,
  IconReceipt,
  IconUser,
  IconShieldCheck,
  IconCopy,
  IconCheck,
  IconQuestionMark,
  IconSearch,
  IconX,
  IconCalendar,
} from "@tabler/icons-react";
import { formatPersianNumber, toPersianDateTime } from "@/utils/format";
import {
  createSupportTicket,
  getTicketMessages,
  addTicketMessage,
  SupportTicketItem,
  SupportMessageItem,
  FAQItem,
} from "./support.action";

const TICKET_TYPES: Record<string, { label: string; icon: any; color: string }> = {
  ORDER_ISSUE: { label: "مشکل در سفارش و ارسال", icon: IconAlertCircle, color: "text-amber-600 bg-amber-50 border-amber-200" },
  QUESTION: { label: "سؤال و مشاوره دارویی", icon: IconHelpCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
  COMPLAINT: { label: "ثبت شکایت و نارضایتی", icon: IconAlertCircle, color: "text-rose-600 bg-rose-50 border-rose-200" },
  REFUND: { label: "استرداد وجه و لغو", icon: IconReceipt, color: "text-purple-600 bg-purple-50 border-purple-200" },
  SUGGESTION: { label: "پیشنهاد و انتقاد", icon: IconMessageCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
};

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: "در انتظار بررسی", bg: "bg-amber-100", text: "text-amber-800" },
  IN_PROGRESS: { label: "در حال پیگیری", bg: "bg-blue-100", text: "text-blue-800" },
  ANSWERED: { label: "پاسخ داده شده", bg: "bg-emerald-100", text: "text-emerald-800" },
  CLOSED: { label: "بسته شده", bg: "bg-gray-100", text: "text-gray-700" },
};

interface SupportViewProps {
  initialTickets: SupportTicketItem[];
  userOrders: Array<{ id: number; status: string; date: string; amount: number }>;
  hoursInfo: {
    isOpen: boolean;
    nextOpenTime: string;
    workingHoursText: string;
    averageResponseTime: string;
    closedNotice: string;
  };
  initialFaqs: FAQItem[];
}

export default function SupportView({
  initialTickets,
  userOrders,
  hoursInfo,
  initialFaqs,
}: SupportViewProps) {
  const [activeTab, setActiveTab] = useState<"tickets" | "faqs">("tickets");
  const [tickets, setTickets] = useState<SupportTicketItem[]>(initialTickets);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(
    initialTickets?.[0]?.id || null
  );

  // Conversation thread state for the expanded ticket
  const [threadMessages, setThreadMessages] = useState<Record<number, SupportMessageItem[]>>({});
  const [loadingThread, setLoadingThread] = useState<boolean>(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Copy tracking code state
  const [copiedTicketNum, setCopiedTicketNum] = useState<string | null>(null);

  // Form states
  const [type, setType] = useState("ORDER_ISSUE");
  const [orderId, setOrderId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // FAQ search
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(initialFaqs?.[0]?.id || null);

  // Fetch thread messages when a ticket is expanded
  useEffect(() => {
    if (expandedTicketId && !threadMessages[expandedTicketId]) {
      setLoadingThread(true);
      getTicketMessages(expandedTicketId)
        .then((msgs) => {
          setThreadMessages((prev) => ({ ...prev, [expandedTicketId]: msgs }));
        })
        .finally(() => setLoadingThread(false));
    }
  }, [expandedTicketId, threadMessages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTicketNum(text);
    setTimeout(() => setCopiedTicketNum(null), 2500);
  };

  const handleToggleExpand = (id: number) => {
    setExpandedTicketId(expandedTicketId === id ? null : id);
    setReplyText("");
  };

  const handleSendThreadReply = async (ticketId: number) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await addTicketMessage(ticketId, replyText);
      if (res.success) {
        setReplyText("");
        // Refresh messages
        const updatedMsgs = await getTicketMessages(ticketId);
        setThreadMessages((prev) => ({ ...prev, [ticketId]: updatedMsgs }));
        // Update ticket in local list to PENDING
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: "PENDING", updated_at: new Date().toISOString() } : t))
        );
      } else {
        alert(res.message);
      }
    } catch {
      alert("خطا در ارسال پیام");
    } finally {
      setSendingReply(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMsg("لطفاً موضوع و متن پیام را وارد فرمایید.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await createSupportTicket({
        type,
        orderId: orderId ? Number(orderId) : null,
        subject,
        message,
        priority,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        const newTicketId = res.ticketId || Date.now();
        const newTicket: SupportTicketItem = {
          id: newTicketId,
          ticketNumber: res.ticketNumber || `TK-${Date.now().toString().slice(-6)}`,
          userId: "",
          userName: "",
          userPhone: "",
          orderId: orderId ? Number(orderId) : null,
          type: type as any,
          subject,
          message,
          priority: priority as any,
          status: "PENDING",
          adminReply: null,
          adminRepliedAt: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messagesCount: 1,
        };

        setTickets([newTicket, ...tickets]);
        setExpandedTicketId(newTicketId);
        // Pre-populate thread
        setThreadMessages((prev) => ({
          ...prev,
          [newTicketId]: [
            {
              id: Date.now(),
              ticketId: newTicketId,
              senderRole: "USER",
              senderName: "شما",
              message,
              created_at: new Date().toISOString(),
            },
          ],
        }));

        setTimeout(() => {
          setShowCreateModal(false);
          setSubject("");
          setMessage("");
          setOrderId("");
          setSuccessMsg("");
        }, 1500);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg("خطا در ارتباط با سرور. لطفاً دوباره تلاش فرمایید.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaqs = initialFaqs.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      {/* Support Working Hours & SLA Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/20 flex items-center gap-1.5">
                <IconHeadphones size={15} />
                <span>مرکز پشتیبانی و ارتباط با مشتریان طِب خیّر</span>
              </span>
              {hoursInfo.isOpen ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>پاسخگویی آنلاین فعال است</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>خارج از ساعات کاری (شروع پاسخگویی: {hoursInfo.nextOpenTime})</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">پشتیبانی و درخواست‌های من</h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              ساعات کاری واحد پشتیبانی: <strong className="text-amber-300 font-bold">{hoursInfo.workingHoursText}</strong>
              <br />
              <span className="text-gray-300/90 text-xs">
                {hoursInfo.averageResponseTime}. کلیه درخواست‌ها دارای شماره پیگیری اختصاصی بوده و پس از پاسخگویی مدیریت، از طریق پیامک اطلاع‌رسانی می‌گردد.
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-xl transition transform active:scale-95"
          >
            <IconPlus size={18} />
            <span>ثبت درخواست جدید</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Tickets vs FAQs */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
            activeTab === "tickets"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <IconMessageCircle size={18} />
          <span>درخواست‌ها و مکاتبات من</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === "tickets" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {formatPersianNumber(tickets.length)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("faqs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
            activeTab === "faqs"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <IconQuestionMark size={18} />
          <span>پرسش‌های متداول (FAQ)</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === "faqs" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {formatPersianNumber(initialFaqs.length)}
          </span>
        </button>
      </div>

      {/* TAB 1: TICKETS VIEW */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <IconHeadphones size={32} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800">
                شما هنوز هیچ درخواست یا سؤالی ثبت نکرده‌اید
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                در صورت بروز هرگونه مشکل در سفارش، پیگیری ارسال مرسوله یا سؤالات مشاوره‌ای، همکاران ما آماده پاسخگویی هستند.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition shadow-xs"
              >
                <IconPlus size={16} />
                <span>ثبت اولین درخواست پشتیبانی</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const typeInfo = TICKET_TYPES[ticket.type] || TICKET_TYPES.QUESTION;
                const statusInfo = STATUS_LABELS[ticket.status] || STATUS_LABELS.PENDING;
                const isExpanded = expandedTicketId === ticket.id;
                const messages = threadMessages[ticket.id] || [];

                return (
                  <div
                    key={ticket.id}
                    className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden ${
                      isExpanded ? "border-blue-400 ring-2 ring-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* Ticket Header Row */}
                    <div
                      onClick={() => handleToggleExpand(ticket.id)}
                      className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl border flex-shrink-0 ${typeInfo.color}`}>
                          <typeInfo.icon size={20} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                              {ticket.subject}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.text}`}>
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                            {/* Unique Tracking Number */}
                            <div className="flex items-center gap-1 font-mono bg-blue-50/80 text-blue-900 px-2 py-0.5 rounded border border-blue-200/60 font-bold">
                              <span>شماره پیگیری:</span>
                              <span className="text-blue-700">{ticket.ticketNumber}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(ticket.ticketNumber);
                                }}
                                className="text-gray-400 hover:text-blue-700 transition p-0.5"
                                title="کپی شماره پیگیری"
                              >
                                {copiedTicketNum === ticket.ticketNumber ? (
                                  <IconCheck size={13} className="text-emerald-600" />
                                ) : (
                                  <IconCopy size={13} />
                                )}
                              </button>
                            </div>

                            {ticket.orderId && (
                              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                                سفارش #{formatPersianNumber(ticket.orderId)}
                              </span>
                            )}

                            <span className="flex items-center gap-1">
                              <IconClock size={14} className="text-gray-400" />
                              <span>{toPersianDateTime(ticket.created_at)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-bold text-blue-600">
                        <span>{isExpanded ? "بستن جزئیات و مکاتبات" : "مشاهده گفتگو و پاسخ"}</span>
                        {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                      </div>
                    </div>

                    {/* Ticket Expanded Details & Conversation Thread */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/60 p-4 sm:p-6 space-y-4">
                        {/* Conversation History */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                            <IconMessageCircle size={16} className="text-blue-600" />
                            <span>سوابق کامل مکاتبات تیکت #{ticket.ticketNumber}</span>
                          </h4>

                          {loadingThread && messages.length === 0 ? (
                            <div className="py-6 text-center text-xs text-gray-400">
                              در حال دریافت سوابق مکاتبات...
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Initial ticket message if thread is empty or has items */}
                              {messages.length === 0 ? (
                                <div className="p-4 rounded-2xl bg-white border border-gray-200 text-xs sm:text-sm text-gray-800 shadow-2xs space-y-2">
                                  <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-100 pb-1.5">
                                    <span className="font-bold text-gray-700">شما (ثبت درخواست اولیه)</span>
                                    <span>{toPersianDateTime(ticket.created_at)}</span>
                                  </div>
                                  <p className="whitespace-pre-line leading-relaxed">{ticket.message}</p>
                                </div>
                              ) : (
                                messages.map((msg) => {
                                  const isAdmin = msg.senderRole === "ADMIN";
                                  return (
                                    <div
                                      key={msg.id}
                                      className={`p-4 rounded-2xl border text-xs sm:text-sm shadow-2xs space-y-2 ${
                                        isAdmin
                                          ? "bg-emerald-50/70 border-emerald-200 text-gray-900 mr-2 sm:mr-6"
                                          : "bg-white border-gray-200 text-gray-800 ml-2 sm:ml-6"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between text-xs border-b pb-1.5 border-black/5">
                                        <span className={`font-bold flex items-center gap-1.5 ${isAdmin ? "text-emerald-800" : "text-blue-800"}`}>
                                          {isAdmin ? <IconShieldCheck size={15} /> : <IconUser size={15} />}
                                          <span>{isAdmin ? "مدیریت و پشتیبانی طِب خیّر" : "شما"}</span>
                                        </span>
                                        <span className="text-gray-400">{toPersianDateTime(msg.created_at)}</span>
                                      </div>
                                      <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>

                        {/* Customer Follow-up Reply Box */}
                        {ticket.status !== "CLOSED" ? (
                          <div className="pt-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              ارسال پیام جدید در این گفتگو:
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <textarea
                                rows={2}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="پاسخ یا توضیح تکمیلی خود را اینجا بنویسید..."
                                className="flex-1 p-3 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                              />
                              <button
                                type="button"
                                disabled={sendingReply || !replyText.trim()}
                                onClick={() => handleSendThreadReply(ticket.id)}
                                className="self-end sm:self-stretch px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                <IconSend size={15} />
                                <span>{sendingReply ? "در حال ارسال..." : "ارسال پیام"}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-100 rounded-xl text-xs text-gray-500 text-center font-bold">
                            این تیکت پشتیبانی توسط مدیریت بسته شده است. در صورت نیاز به موضوع جدید، یک تیکت جدید ثبت فرمایید.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FAQS ACCORDION */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          {/* FAQ Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="جستجو در میان پرسش‌های متداول..."
              className="w-full p-3.5 pr-11 rounded-2xl border border-gray-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
            />
            <IconSearch size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center text-xs text-gray-500">
              پرسشی با عبارت جستجوشده یافت نشد.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredFaqs.map((faq) => {
                const isOpen = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs transition"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                      className="w-full p-4 text-right flex items-center justify-between gap-3 font-bold text-gray-800 text-xs sm:text-sm hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-black">
                          ؟
                        </span>
                        <span>{faq.question}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 text-gray-400">
                        <span className="text-[11px] font-normal px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                          {faq.category}
                        </span>
                        {isOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-gray-900 font-black text-base">
                <IconHeadphones size={22} className="text-blue-600" />
                <span>ثبت درخواست پشتیبانی جدید</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Off-hours banner inside modal if support is currently closed */}
            {!hoursInfo.isOpen && (
              <div className="bg-amber-50 border-b border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2">
                <IconClock size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>ساعات کاری پشتیبانی به پایان رسیده است.</strong>
                  <p className="mt-0.5 text-amber-800 text-[11px]">
                    پیام شما در صف بررسی ثبت شده و در ساعات آغاز به کار واحد پشتیبانی ({hoursInfo.nextOpenTime}) در اولویت رسیدگی قرار خواهد گرفت.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  {successMsg}
                </div>
              )}

              {/* Ticket Type */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">نوع درخواست:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {Object.entries(TICKET_TYPES).map(([k, val]) => (
                    <option key={k} value={k}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Related Order (optional) */}
              {userOrders && userOrders.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-gray-700">مربوط به سفارش (اختیاری):</label>
                  <select
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">بدون انتخاب سفارش (سؤال عمومی)</option>
                    {userOrders.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        سفارش #{ord.id} ({toPersianDateTime(ord.date)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">موضوع درخواست:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: پیگیری تأخیر در ارسال مرسوله پستی"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700">شرح کامل مشکل یا سؤال:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="لطفاً جزئیات کامل درخواست خود را شرح دهید..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  <IconSend size={15} />
                  <span>{submitting ? "در حال ثبت..." : "ثبت و ارسال به پشتیبانی"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
