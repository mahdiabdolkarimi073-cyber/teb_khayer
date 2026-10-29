"use client";

import React, {useEffect, useState} from "react";
import {
    IconMapPin,
    IconPlus,
    IconEdit,
    IconTrash,
    IconStar,
    IconStarFilled,
    IconBuilding,
    IconHome,
    IconBriefcase,
    IconAlertCircle,
} from "@tabler/icons-react";
import {useAction} from "@/utils/server";
import {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    type AddressData,
} from "@/app/(web)/dashboard/addresses/action";
import styles from "./addresses.module.css";

type Address = {
    id: string;
    userId: string;
    title: string;
    name: string;
    phone: string;
    state: string;
    city: string;
    address: string;
    zipcode: string | null;
    isDefault: boolean;
    created_at: string;
    updated_at: string;
};

const TITLE_PRESETS = ["منزل", "محل کار", "سایر"];

const titleIcon = (title: string) => {
    if (title === "منزل") return <IconHome size={16} />;
    if (title === "محل کار") return <IconBriefcase size={16} />;
    return <IconMapPin size={16} />;
};

const emptyForm: AddressData = {
    title: "منزل",
    name: "",
    phone: "",
    state: "",
    city: "",
    address: "",
    zipcode: "",
    isDefault: false,
};

const AddressesView = ({initialAddresses}: {initialAddresses: Address[]}) => {
    const {result: addresses, isPending, refetch} = useAction(getAddresses);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<AddressData>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [zipcodeError, setZipcodeError] = useState("");
    const [addressError, setAddressError] = useState("");

    const list = (addresses as Address[] | undefined) ?? initialAddresses ?? [];

    const openAdd = () => {
        setForm({
            ...emptyForm,
            isDefault: list.length === 0,
        });
        setEditingId(null);
        setError("");
        setZipcodeError("");
        setAddressError("");
        setShowForm(true);
    };

    const openEdit = (addr: Address) => {
        setForm({
            title: addr.title,
            name: addr.name,
            phone: addr.phone,
            state: addr.state,
            city: addr.city,
            address: addr.address,
            zipcode: addr.zipcode || "",
            isDefault: addr.isDefault,
        });
        setEditingId(addr.id);
        setError("");
        setZipcodeError("");
        setAddressError("");
        setShowForm(true);
    };

    const handleZipcodeChange = (val: string) => {
        // Convert Persian/Arabic digits to English and keep only numbers
        const englishDigits = val
            .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
            .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
            .replace(/\D/g, "");
        const trimmed = englishDigits.slice(0, 10);
        setForm((prev) => ({...prev, zipcode: trimmed}));

        if (trimmed.length > 0 && trimmed.length !== 10) {
            setZipcodeError(`کد پستی باید دقیقاً ۱۰ رقم باشد (در حال حاضر ${trimmed.length} رقم وارد شده است)`);
        } else {
            setZipcodeError("");
        }
    };

    const handleAddressChange = (val: string) => {
        setForm((prev) => ({...prev, address: val}));
        if (val.trim().length > 0 && val.trim().length < 6) {
            setAddressError("لطفاً آدرس را با جزئیات بیشتر (شامل خیابان، کوچه، پلاک و طبقه) وارد کنید");
        } else {
            setAddressError("");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim() || !form.phone.trim() || !form.state.trim() || !form.city.trim() || !form.address.trim()) {
            setError("لطفاً همه فیلدهای ضروری را پر کنید.");
            return;
        }

        if (form.address.trim().length < 6) {
            setError("آدرس تحویل باید شامل جزئیات کافی مانند خیابان، کوچه و پلاک باشد.");
            setAddressError("آدرس وارد شده بسیار کوتاه است");
            return;
        }

        if (form.zipcode && form.zipcode.trim()) {
            const digits = form.zipcode.replace(/\D/g, "");
            if (digits.length !== 10) {
                setError("کد پستی وارد شده نامعتبر است. کد پستی ایران باید دقیقاً ۱۰ رقم عددی باشد.");
                setZipcodeError("کد پستی باید دقیقاً ۱۰ رقم باشد");
                return;
            }
        }

        setSaving(true);
        try {
            const res = editingId ? await updateAddress(editingId, form) : await addAddress(form);
            if (!res?.success) {
                setError(res?.message || "ذخیره آدرس انجام نشد.");
                setSaving(false);
                return;
            }

            setSuccessMessage(res.message || "آدرس با موفقیت ذخیره شد.");
            setTimeout(() => setSuccessMessage(""), 4000);
            setShowForm(false);
            refetch();
        } catch {
            setError("ذخیره آدرس انجام نشد. لطفاً ارتباط اینترنت را بررسی و دوباره تلاش کنید.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("آیا از حذف این آدرس مطمئن هستید؟")) return;
        try {
            const res = await deleteAddress(id);
            if (!res?.success) {
                alert(res?.message || "حذف آدرس انجام نشد.");
                return;
            }
            setSuccessMessage(res.message || "آدرس با موفقیت حذف شد.");
            setTimeout(() => setSuccessMessage(""), 4000);
            refetch();
        } catch {
            alert("حذف آدرس انجام نشد");
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const res = await setDefaultAddress(id);
            if (!res?.success) {
                alert(res?.message || "تعیین آدرس پیش‌فرض انجام نشد.");
                return;
            }
            setSuccessMessage(res.message || "آدرس پیش‌فرض با موفقیت تغییر کرد.");
            setTimeout(() => setSuccessMessage(""), 4000);
            refetch();
        } catch {
            alert("تعیین آدرس پیش‌فرض انجام نشد");
        }
    };

    return (
        <div className={styles.page}>
            {successMessage && (
                <div style={{
                    backgroundColor: "#ecfdf5",
                    borderColor: "#a7f3d0",
                    borderWidth: 1,
                    borderStyle: "solid",
                    color: "#065f46",
                    padding: "12px 16px",
                    borderRadius: 12,
                    marginBottom: 16,
                    fontSize: 13,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}>
                    <span>✓</span>
                    <span>{successMessage}</span>
                </div>
            )}
            <div className={styles.header}>
                <h3>آدرس‌های من</h3>
                <button className={styles.addBtn} onClick={openAdd}>
                    <IconPlus size={16} />
                    افزودن آدرس جدید
                </button>
            </div>

            {list.length === 0 ? (
                <div className={styles.empty}>
                    <IconMapPin size={48} stroke={1.5} />
                    <h4>هنوز هیچ آدرسی ثبت نکرده‌اید</h4>
                    <p>با افزودن آدرس، خریدهای بعدی شما سریع‌تر و راحت‌تر انجام می‌شوند.</p>
                    <button className={styles.addBtn} onClick={openAdd}>
                        <IconPlus size={16} />
                        افزودن اولین آدرس
                    </button>
                </div>
            ) : (
                <div className={styles.list}>
                    {list.map((addr) => (
                        <div
                            key={addr.id}
                            className={`${styles.card} ${addr.isDefault ? styles.cardDefault : ""}`}
                        >
                            <div className={styles.cardHead}>
                                <div className={styles.cardTitle}>
                                    {titleIcon(addr.title)}
                                    <span>{addr.title}</span>
                                </div>
                                {addr.isDefault && (
                                    <span className={styles.badge}>
                                        <IconStarFilled size={12} />
                                        پیش‌فرض
                                    </span>
                                )}
                            </div>
                            <div className={styles.cardBody}>
                                <div><strong>گیرنده:</strong> {addr.name}</div>
                                <div><strong>تلفن:</strong> {addr.phone}</div>
                                <div><strong>شهر:</strong> {addr.state} - {addr.city}</div>
                                <div><strong>نشانی:</strong> {addr.address}</div>
                                {addr.zipcode && <div><strong>کد پستی:</strong> {addr.zipcode}</div>}
                            </div>
                            <div className={styles.cardActions}>
                                {!addr.isDefault && (
                                    <button
                                        className={`${styles.actBtn} ${styles.actBtnPrimary}`}
                                        onClick={() => handleSetDefault(addr.id)}
                                    >
                                        <IconStar size={14} />
                                        تعیین به‌عنوان پیش‌فرض
                                    </button>
                                )}
                                <button
                                    className={styles.actBtn}
                                    onClick={() => openEdit(addr)}
                                >
                                    <IconEdit size={14} />
                                    ویرایش
                                </button>
                                <button
                                    className={`${styles.actBtn} ${styles.actBtnDanger}`}
                                    onClick={() => handleDelete(addr.id)}
                                >
                                    <IconTrash size={14} />
                                    حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className={styles.formOverlay} onClick={() => setShowForm(false)}>
                    <div className={styles.formBox} onClick={(e) => e.stopPropagation()}>
                        <h3>{editingId ? "ویرایش آدرس" : "افزودن آدرس جدید"}</h3>
                        <form onSubmit={handleSave}>
                            <div className={styles.formGrid}>
                                <div className={styles.formFieldFull}>
                                    <label>عنوان آدرس</label>
                                    <div className={styles.titleSelect}>
                                        {TITLE_PRESETS.map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                className={`${styles.titleChip} ${form.title === t ? styles.titleChipActive : ""}`}
                                                onClick={() => setForm({...form, title: t})}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.formField}>
                                    <label>نام و نام خانوادگی گیرنده <span>*</span></label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({...form, name: e.target.value})}
                                        placeholder="نام و نام خانوادگی تحویل‌گیرنده"
                                        required
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>شماره تلفن همراه گیرنده <span>*</span></label>
                                    <input
                                        value={form.phone}
                                        onChange={(e) => setForm({...form, phone: e.target.value})}
                                        placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                                        inputMode="tel"
                                        required
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>استان <span>*</span></label>
                                    <input
                                        value={form.state}
                                        onChange={(e) => setForm({...form, state: e.target.value})}
                                        placeholder="مثال: اردبیل"
                                        required
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>شهر <span>*</span></label>
                                    <input
                                        value={form.city}
                                        onChange={(e) => setForm({...form, city: e.target.value})}
                                        placeholder="مثال: اردبیل"
                                        required
                                    />
                                </div>

                                {/* اصلاح فیلد آدرس کامل با کادر استاندارد و ارتفاع مناسب */}
                                <div className={styles.formFieldFull}>
                                    <label>
                                        آدرس کامل پستی <span>*</span>
                                    </label>
                                    <textarea
                                        value={form.address}
                                        onChange={(e) => handleAddressChange(e.target.value)}
                                        placeholder="نام محله / خیابان اصلی، کوچه، پلاک، طبقه و واحد تحویل کالا"
                                        rows={4}
                                        required
                                    />
                                    <div className={styles.fieldHelper}>
                                        <span>لطفاً پلاک، طبقه و شماره واحد را نیز دقیق درج نمایید</span>
                                        <span>{form.address.length} کاراکتر</span>
                                    </div>
                                    {addressError && (
                                        <div className={styles.fieldError}>
                                            <IconAlertCircle size={14} />
                                            <span>{addressError}</span>
                                        </div>
                                    )}
                                </div>

                                {/* اصلاح فیلد کد پستی ۱۰ رقمی با اعتبارسنجی خوانا */}
                                <div className={styles.formFieldFull}>
                                    <label>
                                        کد پستی ۱۰ رقمی (بدون خط تیره)
                                    </label>
                                    <div className={styles.zipcodeInputWrapper}>
                                        <input
                                            className={styles.zipcodeInput}
                                            value={form.zipcode || ""}
                                            onChange={(e) => handleZipcodeChange(e.target.value)}
                                            placeholder="مثال: ۵۶۱۳۶۱۲۳۴۵"
                                            maxLength={10}
                                            inputMode="numeric"
                                            autoComplete="postal-code"
                                        />
                                        <span className={styles.zipcodeBadge}>
                                            {form.zipcode ? `${form.zipcode.length}/۱۰ رقم` : "۱۰ رقم"}
                                        </span>
                                    </div>
                                    <div className={styles.fieldHelper}>
                                        <span>کد پستی ۱۰ رقمی درج‌شده در پشت کارت ملی یا قبض شهری</span>
                                    </div>
                                    {zipcodeError && (
                                        <div className={styles.fieldError}>
                                            <IconAlertCircle size={14} />
                                            <span>{zipcodeError}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.formFieldFull} style={{marginTop: 8}}>
                                    <label style={{display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151"}}>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(form.isDefault)}
                                            onChange={(e) => setForm({...form, isDefault: e.target.checked})}
                                            style={{width: 18, height: 18, accentColor: "#2563eb", cursor: "pointer"}}
                                        />
                                        <span>تعیین به‌عنوان آدرس پیش‌فرض جهت تحویل سفارش‌ها</span>
                                    </label>
                                </div>
                            </div>

                            {error && (
                                <p style={{color: "#dc2626", fontSize: 13, marginTop: 12, fontWeight: 700}}>
                                    {error}
                                </p>
                            )}

                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>
                                    انصراف
                                </button>
                                <button type="submit" className={styles.saveBtn} disabled={saving}>
                                    {saving ? "در حال ذخیره..." : editingId ? "ذخیره تغییرات" : "ثبت آدرس"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressesView;
