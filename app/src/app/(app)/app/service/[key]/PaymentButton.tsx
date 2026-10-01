"use client";

import React, { useState } from "react";
import { Button, Loader } from "@mantine/core";
import { handleServicePayment } from "@/app/(app)/app/service/[key]/action";
import { Service } from "@prisma/client";
import { useRouter } from "next/navigation";
import { closeLastModal } from "@/utils/modal";

const PaymentButton = (props: {
    service: Service,
    disabled?: boolean,
    onClick?: () => any
}) => {
    let { service } = props;
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (loading) return;

        setLoading(true);

        try {
            if (props.onClick) {
                await props.onClick();
                setLoading(false);
                return;
            }

            const res = await handleServicePayment(service?.id);

            if (res.ok) {
                if (res.token && typeof window.doPayment === 'function') {
                    window.doPayment(res.token);
                } else if (res.token) {
                    alert(`توکن پرداخت: ${res.token}`);
                } else {
                    alert('توکن پرداخت دریافت نشد');
                }
            } else if (res.link) {
                router.push(res.link + (res.link.includes('?') ? '&' : '?') + `redirect=${window.location.pathname}`);
                closeLastModal();
            } else {
                alert(res.message || 'خطا در پرداخت');
            }
        } catch (error) {
            console.error('Payment error:', error);
            const isNetworkErr = error?.message?.includes?.('fetch') || error?.message?.includes?.('network') || error?.message?.includes?.('Failed');
            alert(isNetworkErr ? 'ارتباط با سرور برقرار نشد. اینترنت خود را بررسی کنید.' : 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={props?.disabled || service?.disabled || loading}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <Loader size="xs" color="white" />
                    <span>در حال پرداخت...</span>
                </div>
            ) : (
                props.disabled ? "فعال شده" :
                !!service.amount ? (service.disabled ? "غیرفعال" : "پرداخت") :
                "فعال سازی"
            )}
        </Button>
    );
}

export default PaymentButton;
