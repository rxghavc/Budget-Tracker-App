import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useState } from "react";
import { IconPlus, IconUpload } from "@tabler/icons-react";
import { useCurrency } from "@/components/currency-context";

export function IncomeControls({ onAdd, income }: { onAdd: (income: any) => void, income: any[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: "",
    category: "",
    notes: "",
  });
  const { currency } = useCurrency();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.amount || !form.date) return;
    onAdd({ ...form, amount: parseFloat(form.amount) });
    setForm({ name: "", amount: "", date: "", category: "", notes: "" });
    setOpen(false);
  }

  function handleExportCSV() {
    const header = ["Name", "Amount", "Date", "Category", "Notes"];
    const rows = [header.join(",")];
    (income.length ? income : [form]).forEach((row: any) => {
      rows.push([
        row.name,
        row.amount,
        row.date,
        row.category,
        row.notes || ""
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    });
    const csv = rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `income-export-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4 px-4 lg:px-6 items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="default" size="sm" className="gap-2">
            <IconPlus className="w-4 h-4" /> Add Income
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs mb-1">Name</label>
              <input className="border rounded px-2 py-1 w-full" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs mb-1">Amount</label>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">{currency.symbol}</span>
                  <input type="number" step="0.01" className="border rounded px-2 py-1 w-full flex-1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs mb-1">Date</label>
                <input type="date" className="border rounded px-2 py-1 w-full" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs mb-1">Category</label>
                <input className="border rounded px-2 py-1 w-full" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <div className="flex-1">
                <label className="block text-xs mb-1">Notes</label>
                <input className="border rounded px-2 py-1 w-full" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <Button type="submit" variant="default" size="sm" className="w-full">Add</Button>
          </form>
        </PopoverContent>
      </Popover>
      <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
        <IconUpload className="w-4 h-4" /> Export as CSV
      </Button>
    </div>
  );
}
