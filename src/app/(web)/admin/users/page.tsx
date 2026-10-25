"use client";

import React, { useState } from "react";
import { Table, Badge } from "@mantine/core";
import { useAction } from "@/utils/server";
import { handlePrismaQuery } from "@/app/(web)/admin/action";
import { User } from "@prisma/client";
import Loading from "@/app/(app)/loading";
import Link from "next/link";
import { IconFileText, IconUsers, IconPhone } from "@tabler/icons-react";
import { formatPersianNumber, toPersianDateTime } from "@/utils/format";
import CustomerDossierModal from "@/app/(web)/admin/crm/CustomerDossierModal";

export default function UsersAdminPage() {
  const [selectedUserForDossier, setSelectedUserForDossier] = useState<string | null>(null);

  const { result: users } = useAction<any>(handlePrismaQuery, "user", "findMany", {
    orderBy: {
      date: "desc",
    },
  });

  if (!users) return <Loading />;

  const userList = Array.isArray(users) ? users : [];

  return (
    <div className="p-4 sm:p-6 space-y-4" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">لیست کاربران سیستم</h2>
          <p className="text-xs text-gray-500 mt-1">مشاهده و دسترسی سریع به پرونده کاربران</p>
        </div>

        <Link
          href="/admin/crm"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs self-start sm:self-auto"
        >
          <IconUsers size={16} />
          <span>ورود به سامانه مدیریت مشتریان (CRM)</span>
        </Link>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs bg-white">
        <Table stickyHeader striped highlightOnHover verticalSpacing="sm">
          <Table.Thead className="bg-gray-50">
            <Table.Tr>
              <Table.Th className="text-right">نام و نام خانوادگی</Table.Th>
              <Table.Th className="text-right">شماره تلفن</Table.Th>
              <Table.Th className="text-right">نقش کاربری</Table.Th>
              <Table.Th className="text-right">تاریخ عضویت</Table.Th>
              <Table.Th className="text-center">پرونده مشتری (CRM)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {userList.map((element: User) => (
              <Table.Tr key={element.id}>
                <Table.Td className="font-semibold text-gray-900">{element.name}</Table.Td>
                <Table.Td className="font-mono text-gray-700">
                  {formatPersianNumber(`0${element.phone}`)}
                </Table.Td>
                <Table.Td>
                  <Badge color={element.role === "ADMIN" ? "red" : "blue"} variant="light" size="sm">
                    {element.role === "ADMIN" ? "مدیر" : "کاربر"}
                  </Badge>
                </Table.Td>
                <Table.Td className="text-xs text-gray-500">
                  {element.date ? toPersianDateTime(element.date).split("،")[0] : "-"}
                </Table.Td>
                <Table.Td className="text-center">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForDossier(element.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition"
                  >
                    <IconFileText size={14} />
                    <span>مشاهده پرونده</span>
                  </button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      {selectedUserForDossier && (
        <CustomerDossierModal
          userId={selectedUserForDossier}
          onClose={() => setSelectedUserForDossier(null)}
        />
      )}
    </div>
  );
}