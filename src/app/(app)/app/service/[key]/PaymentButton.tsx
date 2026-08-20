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
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        if (loading) return;
        
        setLoading(true);
        setError(null);

        // ===== لاگ کلاینت =====
        console.log('🖱️ [CLIENT] Payment button clicked');
        console.log('🖱️ Service ID:', service?.id);
        console.log('🖱️ Service amount:', service?.amount);
        console.log('🖱️ Service disabled:', service?.disabled);
        // ======================

        try {
            if (props.onClick) {
                console.log('🖱️ Using custom onClick handler');
                await props.onClick();
                setLoading(false);
                return;
            }

            console.log('🖱️ Calling handleServicePayment...');
            const res = await handleServicePayment(service?.id);
            
            // ===== لاگ پاسخ =====
            console.log('📨 [CLIENT] Response received:', res);
            console.log('📨 ok:', res.ok);
            console.log('📨 has token:', !!res.token);
            console.log('📨 has link:', !!res.link);
            console.log('📨 message:', res.message);
            // =====================

            if (res.ok) {
                console.log('✅ Payment successful, token:', res.token);
                
                if (res.token && typeof window.doPayment === 'function') {
                    console.log('🔄 Calling window.doPayment');
                    window.doPayment(res.token);
                } else if (res.token) {
                    console.warn('⚠️ window.doPayment not found, showing alert');
                    alert(`توکن پرداخت: ${res.token}`);
                } else {
                    console.error('❌ No token received');
                    alert('توکن پرداخت دریافت نشد');
                }
            } else if (res.link) {
                console.log('🔗 Redirecting to:', res.link);
                router.push(res.link + (res.link.includes('?') ? '&' : '?') + `redirect=${window.location.pathname}`);
                closeLastModal();
            } else {
                console.error('❌ Error response:', res.message);
                alert(res.message || 'خطا در پرداخت');
            }
        } catch (error) {
            // ===== لاگ خطا =====
            console.error('💥 [CLIENT] Error in payment:', error);
            if (error instanceof Error) {
                console.error('💥 Error message:', error.message);
                console.error('💥 Error stack:', error.stack);
            }
            // =====================
            
            alert('خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
            console.log('🏁 [CLIENT] Payment flow ended');
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