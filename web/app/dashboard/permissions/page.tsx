"use client"

import { useCallback, useEffect, useState } from "react"
import { KeyRoundIcon, RefreshCwIcon, RouteIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"

import {
  DashboardPage,
  DashboardTableShell,
  DashboardTableStateRow,
  DashboardToolbar,
} from "@/components/dashboard-page"
import { ListPagination } from "@/components/list-pagination"
import { OptionCombobox } from "@/components/option-combobox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  fetchPermissions,
  type AdminPermission,
  type PageResult,
} from "@/lib/api/admin"
import { Status, StatusLabels } from "@/lib/generated/enums"

const listStatusOptions = [
  { value: "all", label: "全部状态" },
  { value: String(Status.Ok), label: StatusLabels[Status.Ok] },
  { value: String(Status.Disabled), label: StatusLabels[Status.Disabled] },
  { value: String(Status.Deleted), label: StatusLabels[Status.Deleted] },
] as const

export default function DashboardPermissionsPage() {
  const [keywordInput, setKeywordInput] = useState("")
  const [groupNameInput, setGroupNameInput] = useState("")
  const [statusFilterInput, setStatusFilterInput] = useState("all")
  const [keyword, setKeyword] = useState("")
  const [groupName, setGroupName] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<PageResult<AdminPermission>>({
    results: [],
    page: { page: 1, limit: 20, total: 0 },
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPermissions({
        keyword: keyword.trim() || undefined,
        groupName: groupName.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit,
      })
      setResult(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "加载权限失败")
    } finally {
      setLoading(false)
    }
  }, [groupName, keyword, limit, page, statusFilter])

  useEffect(() => {
    void loadData()
  }, [loadData])

  function applyFilters() {
    setKeyword(keywordInput)
    setGroupName(groupNameInput)
    setStatusFilter(statusFilterInput)
    setPage(1)
  }

  function handleFilterKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return
    }

    event.preventDefault()
    applyFilters()
  }

  function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage === page) {
      return
    }
    setPage(nextPage)
  }

  return (
    <DashboardPage>
      <DashboardToolbar
        actions={
          <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
            <RefreshCwIcon className={loading ? "animate-spin" : ""} />
            刷新
          </Button>
        }
      >
        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            onKeyDown={handleFilterKeyDown}
            placeholder="按权限名称/编码筛选"
            className="pl-9"
          />
        </div>
        <Input
          value={groupNameInput}
          onChange={(event) => setGroupNameInput(event.target.value)}
          onKeyDown={handleFilterKeyDown}
          placeholder="按分组筛选"
          className="w-full sm:w-44"
        />
        <div className="w-full sm:w-36">
          <OptionCombobox
            value={statusFilterInput}
            onChange={setStatusFilterInput}
            placeholder="全部状态"
            options={[...listStatusOptions]}
          />
        </div>
        <Button variant="outline" onClick={applyFilters} disabled={loading}>
          <SearchIcon />
          查询
        </Button>
      </DashboardToolbar>
      <DashboardTableShell
        pagination={
          <ListPagination
            page={result.page.page}
            total={result.page.total}
            limit={limit}
            loading={loading}
            onPageChange={handlePageChange}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit)
              setPage(1)
            }}
          />
        }
      >
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>权限</TableHead>
                <TableHead>编码</TableHead>
                <TableHead>分组</TableHead>
                <TableHead>接口</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.results.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <KeyRoundIcon className="size-4" />
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.type}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.code}</Badge>
                  </TableCell>
                  <TableCell>{item.groupName}</TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary">{item.method || "ANY"}</Badge>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <RouteIcon className="size-3.5" />
                          {item.apiPath || "-"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === Status.Ok ? "secondary" : "outline"}
                    >
                      {StatusLabels[item.status as Status] ?? String(item.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {loading || result.results.length === 0 ? (
                <DashboardTableStateRow
                  colSpan={5}
                  loading={loading}
                  loadingText="正在加载权限数据..."
                  emptyText="没有匹配的权限数据"
                />
              ) : null}
            </TableBody>
          </Table>
      </DashboardTableShell>
    </DashboardPage>
  )
}
