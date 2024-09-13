'use server'

import { getAllPlayersInDb } from "@/prisma/databaseActions"

export const getAllPlayers = async () => {
    const res = await getAllPlayersInDb();
    return res;
}

// const BASE_URL = 'https://localhost:7280/'; // best practice er å bruke sånn baseUrl og du kan utvide det i hver api method
// const accessToken = '' // hent det fra session eller cookie

// export const getStuff = async (accessToken: string) => {
//     try {
//         const res = await fetch(`${BASE_URL}api/Utenriksstasjon`, {
//             credentials: 'include',
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//             }
//         })
//         const result = await res.json() as RETURN_OBJECT_TYPE_HERE;
//         if (result) {
//             const multiselectStasjonValg: OptionType[] = result.map(
//                 (item: SelectType, index: Number) => ({
//                     label: item.visningsnavn,
//                     value: item.kode,
//                 })
//             );
//             return multiselectStasjonValg;
//         }
//     } catch(err){
//         console.error("Error fetching data:", err);
//     }
// }