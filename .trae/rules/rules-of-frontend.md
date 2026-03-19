# 前端开发规范

## 数据分页规范

### 强制规则：服务器端分页

**所有列表页面的分页都必须采用服务器端分页（Server-side Pagination），禁止使用前端分页（Client-side Pagination）。**

#### 原因
1. **性能优化**：只请求当前页数据，减少网络传输和内存占用
2. **可扩展性**：支持大数据量（数千到数百万条记录）
3. **一致性**：搜索/筛选结果在服务器端执行，保证数据准确性

#### 实现要求

##### 1. 后端 API 设计

```typescript
// Controller 层
@Get()
findAll(
  @Query('page') page: string = '1',
  @Query('pageSize') pageSize: string = '10',
  @Query('search') search?: string,
) {
  return this.service.findAll({
    page: parseInt(page, 10) || 1,
    pageSize: parseInt(pageSize, 10) || 10,
    search,
  })
}

// Service 层
async findAll(params: PaginationParams): Promise<PaginatedResult<T>> {
  const { page, pageSize, search } = params
  const skip = (page - 1) * pageSize

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}

  const [data, total] = await Promise.all([
    this.prisma.model.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.model.count({ where }),
  ])

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
```

##### 2. 前端 API 接口

```typescript
// API 接口定义
export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getList = (params: PaginationParams) => {
  return http.request<ListResult>("get", "/endpoint", { params });
};
```

##### 3. 前端组件实现

```typescript
// 页面组件
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const listData = ref<any[]>([]);

const loadData = async () => {
  const res = await getList({
    page: currentPage.value,
    pageSize: pageSize.value,
    search: searchQuery.value || undefined
  });
  listData.value = res.data.data;
  total.value = res.data.total;
};

// 分页事件处理
const handleSizeChange = () => {
  currentPage.value = 1;
  loadData();
};

const handleCurrentChange = () => {
  loadData();
};

const handleSearch = () => {
  currentPage.value = 1;
  loadData();
};
```

##### 4. 分页组件配置

```vue
<el-pagination
  v-model:current-page="currentPage"
  v-model:page-size="pageSize"
  :page-sizes="[10, 20, 50, 100]"
  :total="total"
  layout="total, sizes, prev, pager, next, jumper"
  @size-change="handleSizeChange"
  @current-change="handleCurrentChange"
/>
```

#### 禁止的行为

❌ **禁止**在前端使用 computed 计算分页数据：
```typescript
// 错误示例 - 前端分页
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return allData.value.slice(start, end);
});
```

❌ **禁止**一次性加载所有数据到前端：
```typescript
// 错误示例
const loadAllData = async () => {
  const res = await getAllData(); // 加载所有数据
  allData.value = res.data;
};
```

#### 适用场景

所有包含列表和分页的页面都必须遵循此规则，包括但不限于：

- 用户管理列表
- 项目管理列表
- 订单列表
- 日志列表
- 任何数据列表页面

#### 例外情况

如果后端 API 尚未实现分页功能，可以临时使用前端分页，但必须：
1. 在代码中添加 TODO 注释
2. 在任务管理系统中创建技术支持任务
3. 尽快推动后端实现分页功能

---

## 其他前端规范

### 组件规范

1. **共有组件**：必须在 `@oops-ai/frontend/src/components` 中定义
2. **页面组件**：必须在 `@oops-ai/frontend/src/views/[page-name]/components` 中定义

### 路由规范

1. 使用 Pure Admin 的路由模块化设计
2. 所有页面组件必须使用 `defineOptions` 定义 `name`
3. 组件 `name` 必须与路由 `name` 保持一致
4. 使用 Remix Icon 图标格式（`ri:图标名称`）

### 表单规范

1. 所有表单必须有客户端验证
2. 必填字段使用 `required` 规则
3. 使用 Element Plus 的 `el-form` 和 `el-form-item`
4. 表单提交前必须验证，验证失败不能提交

### 用户反馈

1. 所有异步操作必须有 loading 状态
2. 操作成功/失败必须显示消息提示
3. 删除等危险操作必须二次确认
4. 使用 `ElMessage` 或 `ElNotification` 显示提示

### 响应式设计

1. 所有页面必须支持响应式布局
2. 移动端和桌面端布局要合理适配
3. 使用 Element Plus 的栅格系统和响应式类
