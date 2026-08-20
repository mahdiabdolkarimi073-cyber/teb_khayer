"use client";
import { Table } from "@mantine/core";
import {useAction} from "@/utils/server";
import {handlePrismaQuery} from "@/app/(web)/admin/action";
import {User} from "@prisma/client";
import Loading from "@/app/(app)/loading";

async function Demo() {
	const {result: users} = useAction<any>(handlePrismaQuery, "user", "findMany", {
		orderBy: {
			id: 'desc'
		}
	});

	if (!users?.length) return <Loading />

	const rows = users.map((element: User) => (
		<Table.Tr key={element.id}>
			<Table.Td>{element.name}</Table.Td>
			<Table.Td>{element.phone}</Table.Td>
		</Table.Tr>
	));

	return (
		<Table stickyHeader stickyHeaderOffset={0}>
			<Table.Thead>
				<Table.Tr>
					<Table.Th>نام و نام خانوادگی</Table.Th>
					<Table.Th>شماره تلفن</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>{rows}</Table.Tbody>
		</Table>
	);
}

export default Demo;