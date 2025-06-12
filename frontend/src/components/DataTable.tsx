import { Table } from '@radix-ui/themes';
import type { ProblemItem } from '..';
import { BookmarkIcon } from '@radix-ui/react-icons';

function DataTable({ data }: { data: ProblemItem[] }) {
  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>문제번호</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>태그</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>제목</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.map((el) => (
          <Table.Row key={el.problemId}>
            <Table.RowHeaderCell width="100px">
              {el.problemId}
            </Table.RowHeaderCell>
            <Table.Cell width="200px">
              <div className="flex items-center">
                <BookmarkIcon />
                {el.tags[0].displayNames[0].name}
              </div>
            </Table.Cell>
            <Table.Cell>{el.titles[0].title}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

export default DataTable;
