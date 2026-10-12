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
};

const AddressesView = ({initialAddresses}: {initialAddresses: Address[]}) => {
    const {result: addresses, isPending, refetch} = useAction(getAddresses);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<AddressData>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const list = (addresses as Address[] | undefined) ?? initialAddresses ?? [];

    const openAdd = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
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
        });
        setEditingId(addr.id);
        setError("");
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim() || !form.state.trim() || !form.city.trim() || !form.address.trim()) {
            setError("لطفاً همه فیلدهای ضروری را پر کنید");
            return;
        }
        setSaving(true);
        setError("");
        try {
            if (editingId) {
                await updateAddress(editingId, form);
            } else {
                await addAddress(form);
            }
            setShowForm(false);
            refetch();
        } catch {
            setError("ذخیره آدرس انجام نشد. دوباره تلاش کنید.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("آیا از حذف این آدرس مطمئن هستید؟")) return;
        try {
            await deleteAddress(id);
            refetch();
        } catch {
            alert("حذف آدرس انجام نشد");
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await setDefaultAddress(id);
            refetch();
        } catch {
            alert("تعیین آدرس پیش‌فرض انجام نشد");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h3>آدرس‌های من</h3>
                <button className={styles.addBtn} onClick={openAdd}>
                    <IconPlus size={16} />
                    افزودن آدرس جدید
                </button>
            </div>

            {isPending && list.length === 0 ? (
                <div className={styles.empty}>
                    <p>در حال بارگذاری...</p>
                </div>
            ) : list.length === 0 ? (
                <div className={styles.empty}>
                    <IconMapPin size={42} color="#0875e1" />
                    <h4>هنوز آدرسی ثبت نکرده‌اید</h4>
                    <p>برای تسهیل خرید بعدی، آدرس‌های خود را اینجا ذخیره کنید</p>
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
                                    {addr.title}
                                </div>
                                {addr.isDefault && (
                                    <span className={styles.badge}>
                                        <IconStarFilled size={11} />
                                        پیش‌فرض
                                    </span>
                                )}
                            </div>
                            <div className={styles.cardBody}>
                                <div><strong>{addr.name}</strong></div>
                                <div>شماره تماس: {addr.phone}</div>
                                <div>{addr.state} - {addr.city}</div>
                                <div>{addr.address}</div>
                                {addr.zipcode && <div>کد پستی: {addr.zipcode}</div>}
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
                                        placeholder="نام گیرنده"
                                        required
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>شماره تلفن گیرنده <span>*</span></label>
                                    <input
                                        value={form.phone}
                                        onChange={(e) => setForm({...form, phone: e.target.value})}
                                        placeholder="شماره تماس"
                                        required
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>استان <span>*</span></label>
                                    <input
                                        value={form.state}
                                        onChange={(e) => setForm({...form, state: e.target.value})}
                                        placeholder="استان"
                                        required
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>شهر <span>*</span></label>
                                    <input
                                        value={form.city}
                                        onChange={(e) => setForm({...form, city: e.target.value})}
                                        placeholder="شهر"
                                        required
                                    />
                                </div>
                                <div className={styles.formFieldFull}>
                                    <label>آدرس کامل <span>*</span></label>
                                    <textarea
                                        value={form.address}
                                        onChange={(e) => setForm({...form, address: e.target.value})}
                                        placeholder="آدرس دقیق تحویل"
                                        required
                                    />
                                </div>
                                <div className={styles.formFieldFull}>
                                    <label>کد پستی (اختیاری)</label>
                                    <input
                                        value={form.zipcode || ""}
                                        onChange={(e) => setForm({...form, zipcode: e.target.value})}
                                        placeholder="کد پستی ۱۰ رقمی"
                                    />
                                </div>
                            </div>
                            {error && <p style={{color: "#c44", fontSize: 12, marginTop: 10}}>{error}</p>}
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
