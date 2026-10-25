"use client";

import React, { useState } from "react";
import { trackOrder } from "@/app/(web)/track/action";
import OrderStatusEnum from "@/generated/OrderStatus.enum";
import Link from "next/link";
import styles from "@/app/(web)/track/track.module.css";

const TrackProduct = (props: any) => {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Awaited<ReturnType<typeof trackOrder>>>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setOrder(undefined);

    if (!orderId || !phone) {
      setError("لطفاً شماره سفارش و شماره تلفن خود را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const result = await trackOrder(Number(orderId), Number(phone));
      if (!result) {
        setError("متأسفانه سفارش شما یافت نشد. لطفاً اطلاعات را بررسی کنید.");
      } else {
        setOrder(result);
      }
    } catch {
      setError("متأسفانه سفارش شما یافت نشد. لطفاً اطلاعات را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  const statusColor: Record<string, string> = {
    PENDING: "#ed812d",
    SENDED: "#1468d8",
    DELAY: "#e8a200",
    CANCELED: "#c53a2e",
  };

  return (
    <>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>اطلاعات پیگیری</h2>
        <p className={styles.formDesc}>
          شماره سفارش و شماره تلفن خود را وارد کنید تا وضعیت سفارش را مشاهده کنید.
        </p>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>شماره سفارش (ID)</label>
            <input
              className={styles.fieldInput}
              type="number"
              inputMode="numeric"
              placeholder="مثال: ۱۲۳۴۵"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>شماره تلفن</label>
            <input
              className={styles.fieldInput}
              type="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="09xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "در حال جستجو..." : "پیگیری سفارش"}
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {order && (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <span
              className={styles.resultStatus}
              style={{
                background: statusColor[order.status] || "#18a56d",
              }}
            >
              {OrderStatusEnum[order.status]}
            </span>
            <span className={styles.resultDate}>
              {new Date(order.created_at).toLocaleString("fa")}
            </span>
          </div>

          <p className={styles.resultAmount}>
            مبلغ سفارش: {Number(order.payment?.amount || 0).toLocaleString("fa")} تومان
          </p>

          {(() => {
            let rawInfo: any = {};
            try {
              rawInfo = typeof order.info === "string" ? JSON.parse(order.info) : (order.info || {});
            } catch {
              rawInfo = {};
            }
            const trackingCode = rawInfo?.trackingCode || rawInfo?.postalCode || rawInfo?.trackingBarcode;
            if (trackingCode) {
              return (
                <div style={{
                  background: "#f0f7ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  margin: "12px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px",
                  fontSize: "13px"
                }}>
                  <div>
                    <span style={{ color: "#4b5563" }}>کد رهگیری مرسوله پستی: </span>
                    <strong style={{ fontFamily: "monospace", color: "#1e40af", fontSize: "14px" }}>{trackingCode}</strong>
                  </div>
                  <a
                    href={`https://tracking.post.ir/?id=${trackingCode}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: 700
                    }}
                  >
                    پیگیری در سامانه شرکت ملی پست ↗
                  </a>
                </div>
              );
            }
            if (order.status === "SENDED" || order.status === "DELAY") {
              return (
                <div style={{
                  background: "#fefce8",
                  border: "1px solid #fef08a",
                  color: "#854d0e",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  margin: "10px 0",
                  fontSize: "12px"
                }}>
                  سفارش تحویل پست گردیده و به زودی کد ۲۴ رقمی رهگیری پیامک خواهد شد.
                </div>
              );
            }
            return null;
          })()}

          <div className={styles.resultProducts}>
            {order.products?.map((p: any, idx: number) => (
              <Link
                key={idx}
                href={`/product/${p?.product?.id}`}
                className={styles.resultProduct}
              >
                <span className={styles.resultProductName}>
                  {p?.product?.name}
                </span>
                <span className={styles.resultProductQty}>
                  {p?.count} عدد
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TrackProduct;
