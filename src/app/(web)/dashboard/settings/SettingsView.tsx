"use client";

import React, {useRef, useState} from "react";
import {
    IconUser,
    IconUserCircle,
    IconPhone,
    IconIdBadge2,
    IconGenderMale,
    IconCalendar,
    IconAt,
    IconCamera,
    IconCheck,
    IconLoader2,
    IconShieldCheck,
    IconDeviceDesktop,
} from "@tabler/icons-react";
import {useAction} from "@/utils/server";
import {toPersianDateTime} from "@/utils/format";
import {
    getProfile,
    updateProfile,
    uploadAvatar,
    type ProfileData,
} from "@/app/(web)/dashboard/settings/action";
import styles from "./settings.module.css";

type UserProfile = {
    id: string;
    name: string;
    phone: number;
    avatar: string;
    nationalCode: string | null;
    gender: string | null;
    birthDate: string | null;
    email: string | null;
};

const GENDER_OPTIONS = [
    {value: "", label: "انتخاب کنید"},
    {value: "male", label: "آقا"},
    {value: "female", label: "خانم"},
];

const SettingsView = ({
    initialProfile,
    lastLogin,
}: {
    initialProfile: UserProfile;
    lastLogin?: { created_at: string; ip: string; userAgent: string } | null;
}) => {
    const {result: profile, refetch} = useAction(getProfile);
    const [form, setForm] = useState<ProfileData>({
        name: initialProfile?.name || "",
        phone: String(initialProfile?.phone || ""),
        nationalCode: initialProfile?.nationalCode || "",
        gender: initialProfile?.gender || "",
        birthDate: initialProfile?.birthDate || "",
        email: initialProfile?.email || "",
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const current = (profile as UserProfile | null) ?? initialProfile;
    const avatarUrl = current?.avatar || "/backend/images/default_avatar.png";

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess(false);
        try {
            const res = await updateProfile(form);
            if (res?.success) {
                setSuccess(true);
                refetch();
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(res?.message || "ذخیره اطلاعات ناموفق بود");
            }
        } catch {
            setError("ذخیره اطلاعات ناموفق بود. دوباره تلاش کنید.");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setError("حجم تصویر نباید بیشتر از ۲ مگابایت باشد");
            return;
        }
        setUploading(true);
        setError("");
        try {
            const res = await uploadAvatar(file);
            if (res?.success) {
                refetch();
            } else {
                setError(res?.message || "آپلود تصویر ناموفق بود");
            }
        } catch {
            setError("آپلود تصویر ناموفق بود");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h3>تنظیمات</h3>
            </div>

            <div className={styles.card}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatarWrapper}>
                        <img
                            src={avatarUrl}
                            alt="پروفایل"
                            className={styles.avatarImg}
                        />
                        <label className={styles.avatarUploadBtn}>
                            {uploading ? (
                                <IconLoader2 size={16} className={styles.spin} />
                            ) : (
                                <IconCamera size={16} />
                            )}
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                disabled={uploading}
                                hidden
                            />
                        </label>
                    </div>
                    <div className={styles.avatarHint}>
                        <strong>تصویر پروفایل</strong>
                        <span>برای تغییر، روی دوربین کلیک کنید</span>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.sectionTitle}>
                    <IconUserCircle size={18} />
                    اطلاعات کاربری (اختیاری)
                </div>

                <form onSubmit={handleSave} className={styles.form}>
                    <div className={styles.formGrid}>
                        <div className={styles.formField}>
                            <label>
                                <IconUser size={14} />
                                نام و نام خانوادگی
                            </label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({...form, name: e.target.value})}
                                placeholder="نام و نام خانوادگی"
                            />
                        </div>

                        <div className={styles.formField}>
                            <label>
                                <IconPhone size={14} />
                                شماره همراه
                            </label>
                            <input
                                value={form.phone}
                                disabled
                                className={styles.disabled}
                                placeholder="شماره همراه"
                            />
                        </div>

                        <div className={styles.formField}>
                            <label>
                                <IconIdBadge2 size={14} />
                                کد ملی
                            </label>
                            <input
                                value={form.nationalCode}
                                onChange={(e) => setForm({...form, nationalCode: e.target.value})}
                                placeholder="کد ملی"
                                maxLength={10}
                            />
                        </div>

                        <div className={styles.formField}>
                            <label>
                                <IconGenderMale size={14} />
                                جنسیت
                            </label>
                            <select
                                value={form.gender}
                                onChange={(e) => setForm({...form, gender: e.target.value})}
                            >
                                {GENDER_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formField}>
                            <label>
                                <IconCalendar size={14} />
                                تاریخ تولد
                            </label>
                            <input
                                value={form.birthDate}
                                onChange={(e) => setForm({...form, birthDate: e.target.value})}
                                placeholder="مثال: 1370/05/15"
                            />
                        </div>

                        <div className={styles.formField}>
                            <label>
                                <IconAt size={14} />
                                ایمیل
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({...form, email: e.target.value})}
                                placeholder="example@email.com"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}
                    {success && (
                        <p className={styles.success}>
                            <IconCheck size={14} />
                            اطلاعات با موفقیت ذخیره شد
                        </p>
                    )}

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.saveBtn} disabled={saving}>
                            {saving ? (
                                <>
                                    <IconLoader2 size={14} className={styles.spin} />
                                    در حال ذخیره...
                                </>
                            ) : (
                                "ذخیره تغییرات"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Last Successful Login & Security Section */}
            <div className={styles.card} style={{ marginTop: "20px" }}>
                <div className={styles.sectionTitle}>
                    <IconShieldCheck size={18} />
                    امنیت حساب و آخرین ورودهای موفق
                </div>
                <div style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "16px",
                    fontSize: "13px",
                    lineHeight: "1.8",
                    color: "#334155"
                }}>
                    {lastLogin ? (
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "#0f172a" }}>
                                <IconDeviceDesktop size={18} color="#2563eb" />
                                <span>آخرین ورود موفق شما به سامانه:</span>
                                <span style={{ color: "#2563eb" }}>{toPersianDateTime(lastLogin.created_at)}</span>
                            </div>
                            <div style={{ marginTop: "6px", color: "#64748b", fontSize: "12px" }}>
                                دستگاه / مرورگر: {lastLogin.userAgent?.includes("Mobile") ? "تلفن همراه" : "رایانه یا تبلت"} (آدرس اتصال امن)
                            </div>
                        </div>
                    ) : (
                        <p>نشست فعلی شما به صورت امن برقرار گردیده و آخرین اطلاعات اتصال ثبت شده است.</p>
                    )}
                    <p style={{ marginTop: "8px", fontSize: "11px", color: "#94a3b8" }}>
                        نکته امنیتی: در صورتی که ورود غیرمعمولی مشاهده نمودید، سریعاً رمز عبور خود را تغییر داده یا با پشتیبانی تماس حاصل فرمایید.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
