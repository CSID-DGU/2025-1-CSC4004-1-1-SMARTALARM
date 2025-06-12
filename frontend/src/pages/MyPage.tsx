import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DataTable from '../components/DataTable';
import type { DataJson } from '../index.d.ts';
import { Spinner } from '@radix-ui/themes';

function MyPage() {
  const [data, setData] = useState<DataJson | null>(null);
  const { id } = useParams();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    try {
      axios
        .get(`${baseUrl}/recommend?user=${id}`, {
          headers: {
            Accept: 'application/json',
          },
        })
        .then((res) => setData(res.data))
        .catch((err) => {
          throw new Error(err);
        });
    } catch (err) {
      console.error(err);
    }
  }, [baseUrl, id]);

  return (
    <>
      <header className="w-full h-12 flex items-center shadow px-6 mb-4">
        <span className="font-bold text-2xl mr-6">NEO-Solved</span>
        {data ? (
          <>
            <img
              src={data.user.items[0].profileImageUrl}
              alt="프로필 사진"
              className="w-8 h-8 rounded-full mr-2"
            />
            <span>{data.user.items[0].handle}</span>
          </>
        ) : (
          <Spinner />
        )}
      </header>
      <main className="w-full flex justify-center">
        <section className="w-fit flex justify-center rounded-xl shadow">
          {data ? <DataTable data={data.problems.items} /> : <Spinner />}
        </section>
      </main>
    </>
  );
}

export default MyPage;
