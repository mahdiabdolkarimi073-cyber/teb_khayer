"use client";

import React, { useState } from "react";
import { Button, TextInput, Textarea } from "@mantine/core";
import { SenderInfoType, updateSenderSettings } from "@/app/(web)/admin/orders/order.action";
import { closeLastModal } from "@/utils/modal";

export function SenderSettingsModal({
  currentSettings,
  onSaved,
}: {
  currentSettings: SenderInfoType;
  onSaved?: (newSettings: SenderInfoType) => void;
}) {
  const [form, setForm] = useState<SenderInfoType>(currentSettings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateSenderSettings(form);
      if (res.success) {
        setMessage(res.message);
        if (onSaved) onSaved(form);
        setTimeout(() => {
          closeLastModal();
        }, 1200);
      }
    } catch {
      setMessage("خطا در ذخیره اطلاعات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm" dir="rtl">
      <p className="text-gray-600 text-xs">
        این اطلاعات به‌عنوان فرستنده در تمامی برچسب‌های پستی A5 چاپ خواهد شد و به‌صورت دائمی در دیتابیس ذخیره می‌شود:
      </p>

      <TextInput
        label="نام فروشگاه / فرستنده"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="شماره تلفن فرستنده"
          dir="ltr"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.currentTarget.value })}
          required
        />
        <TextInput
          label="کد پستی ۱۰ رقمی فرستنده"
          dir="ltr"
          value={form.zipcode}
          onChange={(e) => setForm({ ...form, zipcode: e.currentTarget.value })}
          required
        />
      </div>

      <Textarea
        label="نشانی کامل فرستنده"
        rows={2}
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.currentTarget.value })}
        required
      />

      {message && <div className="p-2 rounded bg-green-50 text-green-700 text-xs font-bold">{message}</div>}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="default" type="button" onClick={() => closeLastModal()}>
          انصراف
        </Button>
        <Button type="submit" loading={loading} color="blue">
          ذخیره اطلاعات فرستنده
        </Button>
      </div>
    </form>
  );
}
