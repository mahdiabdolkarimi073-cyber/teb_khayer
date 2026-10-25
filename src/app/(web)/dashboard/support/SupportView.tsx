"use client";

import React, { useState } from "react";
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
} from "@tabler/icons-react";
import { formatPersianNumber, toPersianDateTime } from "@/utils/format";
import {
  createSupportTicket,
  SupportTicketItem,
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
}

export default function SupportView({ initialTickets, userOrders }: SupportViewProps) {
  const [tickets, setTickets] = useState<SupportTicketItem[]>(initialTickets);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(
    initialTickets?.[0]?.id || null
  );

  // Form states
  const [type, setType] = useState("ORDER_ISSUE");
  const [orderId, setOrderId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
        // Prepend optimistic ticket
        const newTicket: SupportTicketItem = {
          id: Date.now(),
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
        };
        setTickets([newTicket, ...tickets]);
        setExpandedTicketId(newTicket.id);

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
      setErrorMsg("خطایی در ارتباط با سرور رخ داد. دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <IconHeadphones size={24} />
            </span>
            <h2 className="text-xl font-black">پشتیبانی و درخواست‌های من</h2>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 mt-1.5">
            ثبت و پیگیری مستقیم سؤالات پزشکی، مشکلات ارسال و شکایات با کارشناسان طِب خیّر
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMsg("");
            setSuccessMsg("");
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-800 text-xs sm:text-sm font-black hover:bg-blue-50 transition shadow-xs self-start sm:self-auto"
        >
          <IconPlus size={18} />
          <span>ثبت درخواست جدید</span>
        </button>
      </div>

      {/* Info Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <IconClock size={20} />
          </div>
          <div className="text-xs">
            <strong className="block text-gray-800 font-bold">زمان پاسخگویی سریع</strong>
            <span className="text-gray-500">میانگین کمتر از ۲ ساعت کاری</span>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <IconShieldCheck size={20} />
          </div>
          <div className="text-xs">
            <strong className="block text-gray-800 font-bold">رسیدگی رسمی و دقیق</strong>
            <span className="text-gray-500">پاسخ مستقیم توسط مدیریت و پزشکان</span>
          </div>
        </div>

        <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
            <IconReceipt size={20} />
          </div>
          <div className="text-xs">
            <strong className="block text-gray-800 font-bold">پیگیری وضعیت سفارش</strong>
            <span className="text-gray-500">اتصال مستقیم تیکت به کد سفارش</span>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base">
            تاریخچه درخواست‌ها ({formatPersianNumber(tickets.length)})
          </h3>
        </div>

        {tickets.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <IconMessageCircle size={28} />
            </div>
            <h4 className="font-bold text-gray-800 text-sm">شما تاکنون درخواستی ثبت نکرده‌اید</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              در صورت داشتن هرگونه سؤال، مشکل در دریافت سفارش، تاخیر در تحویل یا درخواست مشاوره، روی دکمه «ثبت درخواست جدید» کلیک فرمایید.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
            >
              <IconPlus size={16} />
              <span>ثبت اولین درخواست</span>
            </button>
          </div>
        ) : (
          tickets.map((t) => {
            const isExpanded = expandedTicketId === t.id;
            const typeConfig = TICKET_TYPES[t.type] || TICKET_TYPES.QUESTION;
            const statusConfig = STATUS_LABELS[t.status] || STATUS_LABELS.PENDING;
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs transition hover:border-blue-200"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedTicketId(isExpanded ? null : t.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-gray-50/50 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className={`p-2 rounded-lg border ${typeConfig.color} flex-shrink-0`}>
                      <TypeIcon size={18} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{t.subject}</span>
                        <span className="text-[11px] font-mono text-gray-400">#{t.ticketNumber}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>نوع: {typeConfig.label}</span>
                        {t.orderId && (
                          <span className="font-bold text-blue-600">
                            مربوط به سفارش #{formatPersianNumber(t.orderId)}
                          </span>
                        )}
                        <span>{toPersianDateTime(t.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.label}
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded text-gray-400 hover:text-gray-600"
                      aria-label="نمایش جزئیات"
                    >
                      {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-gray-200 space-y-4 text-xs sm:text-sm bg-white">
                    {/* Customer Message */}
                    <div className="space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-bold text-gray-700 flex items-center gap-1.5">
                          <IconUser size={15} className="text-blue-600" />
                          <span>متن پیام شما:</span>
                        </span>
                        <span>{toPersianDateTime(t.created_at)}</span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed mt-2">
                        {t.message}
                      </p>
                    </div>

                    {/* Admin Response */}
                    {t.adminReply ? (
                      <div className="space-y-2 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                        <div className="flex items-center justify-between text-xs text-emerald-800">
                          <span className="font-bold flex items-center gap-1.5">
                            <IconCircleCheck size={16} className="text-emerald-600" />
                            <span>پاسخ کارشناس پشتیبانی طِب خیّر:</span>
                          </span>
                          <span className="text-emerald-700">
                            {t.adminRepliedAt ? toPersianDateTime(t.adminRepliedAt) : ""}
                          </span>
                        </div>
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-emerald-100">
                          {t.adminReply}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
                        <IconClock size={16} className="text-blue-600 flex-shrink-0" />
                        <span>
                          درخواست شما در نوبت بررسی کارشناسان قرار دارد. به محض ثبت پاسخ، وضعیت به «پاسخ داده شده» تغییر خواهد کرد.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Ticket Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) setShowCreateModal(false);
          }}
        >
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <IconHeadphones size={22} className="text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">ثبت درخواست جدید پشتیبانی</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={submitting}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  {successMsg}
                </div>
              )}

              {/* Type Select */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">نوع درخواست:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                >
                  <option value="ORDER_ISSUE">مشکل یا تاخیر در سفارش</option>
                  <option value="QUESTION">سؤال و مشاوره دارویی</option>
                  <option value="COMPLAINT">ثبت شکایت و نارضایتی</option>
                  <option value="REFUND">درخواست استرداد وجه و لغو</option>
                  <option value="SUGGESTION">پیشنهاد و بهبود خدمات</option>
                </select>
              </div>

              {/* Related Order */}
              {userOrders.length > 0 && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">
                    سفارش مرتبط (اختیاری):
                  </label>
                  <select
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                  >
                    <option value="">بدون انتخاب سفارش</option>
                    {userOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        سفارش #{formatPersianNumber(o.id)} — {toPersianDateTime(o.date).split("،")[0]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">اولویت رسیدگی:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority("NORMAL")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition ${
                      priority === "NORMAL"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    عادی
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority("URGENT")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition ${
                      priority === "URGENT"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    فوری (نیاز به تماس سریع)
                  </button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">موضوع درخواست:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: تاخیر در تحویل بسته کد ۱۲۳۴۵..."
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">شرح پیام یا مشکل:</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="لطفاً شرح کامل سؤال، مشکل یا شکایت خود را یادداشت فرمایید..."
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  required
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-xs font-bold transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                >
                  <IconSend size={16} />
                  <span>{submitting ? "در حال ارسال..." : "ارسال درخواست"}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
