# Data Table Example

A fully-featured data table implementation using TanStack Table v8 and shadcn-svelte components.

## Features

- ✅ Pagination
- ✅ Sorting
- ✅ Filtering
- ✅ Column visibility toggle
- ✅ Row selection
- ✅ Row actions
- ✅ Responsive design
- ✅ Type-safe

## Files

- `columns.ts` - Column definitions with custom cell renderers
- `data-table.svelte` - Main data table component with all features
- `data-table-actions.svelte` - Row action dropdown menu
- `data-table-checkbox.svelte` - Checkbox component for row selection
- `data-table-email-button.svelte` - Sortable column header button
- `+page.svelte` - Page with sample data

## Usage

```svelte
<script lang="ts">
  import DataTable from "./data-table.svelte";
  import { columns } from "./columns.js";

  const data = [
    {
      id: "1",
      amount: 100,
      status: "success",
      email: "user@example.com"
    }
  ];
</script>

<DataTable {data} {columns} />
```

## Customization

### Adding New Columns

Edit `columns.ts` to add new column definitions:

```ts
{
  accessorKey: "newField",
  header: "New Field",
  cell: ({ row }) => row.original.newField
}
```

### Custom Cell Rendering

Use `renderSnippet` for simple HTML or `renderComponent` for complex components:

```ts
import { createRawSnippet } from "svelte";
import { renderSnippet } from "$lib/components/ui/data-table/index.js";

{
  accessorKey: "status",
  cell: ({ row }) => {
    const snippet = createRawSnippet<[{ value: string }]>((getValue) => {
      const { value } = getValue();
      return {
        render: () => `<span class="badge">${value}</span>`
      };
    });
    return renderSnippet(snippet, { value: row.original.status });
  }
}
```

### Changing Page Size

Modify the initial pagination state in `data-table.svelte`:

```ts
let pagination = $state<PaginationState>({ 
  pageIndex: 0, 
  pageSize: 20  // Change from 10 to 20
});
```

## Server-Side Data

To use server-side data, modify `+page.svelte` to load from `+page.server.ts`:

```ts
// +page.server.ts
export async function load() {
  const payments = await fetchPayments();
  return { payments };
}
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import DataTable from "./data-table.svelte";
  import { columns } from "./columns.js";

  let { data } = $props();
</script>

<DataTable data={data.payments} {columns} />
```

## Reusable Component

To make the data table reusable across your app, move `data-table.svelte` to `$lib/components/ui/` and import it where needed.