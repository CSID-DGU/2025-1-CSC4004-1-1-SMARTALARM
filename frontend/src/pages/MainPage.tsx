import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Button, TextField } from '@radix-ui/themes';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const [id, setId] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {
      currentTarget: { value },
    } = e;
    setId(value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/${id}`);
  };
  return (
    <main className="w-screen h-screen flex flex-col gap-2 justify-center items-center">
      <span className="font-[BookkMyungjo-Lt]">오늘도 알고리즘 한 잔</span>
      <h1 className="text-6xl font-bold">NEO-Solved</h1>
      <form className="flex gap-2 mt-6 w-[24rem]" onSubmit={handleSubmit}>
        <TextField.Root
          size="3"
          className="w-full"
          placeholder="ID를 입력해 주세요"
          name="id"
          onChange={handleChange}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon width={16} height={16} />
          </TextField.Slot>
        </TextField.Root>
        <Button type="submit" size="3">
          검색
        </Button>
      </form>
    </main>
  );
}

export default MainPage;
