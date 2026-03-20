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
    search: searchQuery.value || undefined,
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

## 数据类型定义规范

### 强制规则：共享类型定义

**所有服务端和客户端共享的数据模型（DTO、接口、类型）都必须定义在 `@oops-ai/shared` 包中，禁止在各自的业务模块中重复定义。**

#### 原因

1. **类型一致性**：前后端使用同一套类型定义，避免类型不匹配
2. **可维护性**：修改类型只需在一处修改，全局生效
3. **代码复用**：避免重复代码，减少维护成本
4. **类型安全**：编译时即可发现类型错误

#### 命名规范

##### 1. 客户端提交到服务器的 DTO（`*Submit`）

客户端发起请求时使用，命名格式：`[操作][实体]Submit`

```typescript
// ✅ 正确示例
export interface CreateUserSubmit {
  email: string;
  password: string;
  name: string;
  roleId: string;
}

export interface UpdateUserSubmit {
  email?: string;
  password?: string;
  name?: string;
  roleId?: string;
}

export interface CreateProjectSubmit {
  name: string;
  description?: string;
  key: string;
}

export interface AddProjectMemberSubmit {
  userId: string;
  role: string;
  permissions?: any;
}
```

##### 2. 服务器响应的 DTO（`*Result`）

服务器返回单个实体时使用，命名格式：`[实体][操作]Result`

```typescript
// ✅ 正确示例
export interface UserResult {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  role: { name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectResult {
  id: string;
  name: string;
  description?: string;
  key: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}
```

##### 3. 列表项 DTO（`*ListItem`）

服务器返回列表数据中的单个项，命名格式：`[实体]ListItem`

```typescript
// ✅ 正确示例
export interface UserListItem {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  role: { name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  description?: string;
  key: string;
  status?: string;
  createdAt: string;
}
```

##### 4. 分页结果 DTO（`*PaginatedResult`）

服务器返回分页列表时使用，命名格式：`[实体]PaginatedResult`

```typescript
// ✅ 正确示例
export interface UserPaginatedResult {
  data: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProjectPaginatedResult {
  data: ProjectListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

#### 文件组织结构

```
@oops-ai/shared/src/
├── dtos/
│   ├── user.dto.ts          # 用户相关 DTO
│   ├── project.dto.ts       # 项目相关 DTO
│   └── requirement.dto.ts   # 需求相关 DTO
├── models/
│   ├── user.model.ts        # 用户数据模型
│   ├── project.model.ts     # 项目数据模型
│   └── requirement.model.ts # 需求数据模型
└── index.ts                 # 统一导出
```

#### 后端使用示例

```typescript
// users.controller.ts
import {
  CreateUserSubmit,
  UserResult,
  UserPaginatedResult,
} from "@oops-ai/shared";

@Controller("users")
export class UsersController {
  @Post()
  create(@Body() submit: CreateUserSubmit): Promise<UserResult> {
    return this.usersService.create(submit);
  }

  @Get()
  findAll(): Promise<UserPaginatedResult> {
    return this.usersService.findAll();
  }
}
```

#### 前端使用示例

```typescript
// user.api.ts
import { http } from "@/utils/http";
import {
  CreateUserSubmit,
  UpdateUserSubmit,
  UserResult,
  UserPaginatedResult,
} from "@oops-ai/shared";

export const createUser = (data: CreateUserSubmit) => {
  return http.request<UserResult>("post", "/users", { data });
};

export const getUsers = (params: PaginationParams) => {
  return http.request<{ success: boolean; data: UserPaginatedResult }>(
    "get",
    "/users",
    { params },
  );
};
```

#### 禁止的行为

❌ **禁止**在各自业务模块中定义与 shared 重复的类型：

```typescript
// ❌ 错误示例 - 在 frontend 中定义
export interface User {
  id: string;
  email: string;
  // ...
}

// ✅ 正确做法 - 从 shared 导入
import { UserListItem } from "@oops-ai/shared";
```

❌ **禁止**使用不一致的命名：

```typescript
// ❌ 错误示例 - 混乱的命名
export interface UserDTO {} // 应该用 Submit
export interface UserResponse {} // 应该用 Result
export interface UserItem {} // 应该用 ListItem
```

❌ **禁止**在前后端使用不同的类型定义文件

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

### API 请求规范

#### 强制规则：无需从 `data` 属性获取数据

**使用 `http`（PureHttp）发起的请求，在 `then` 或 `await` 之后，不需要从 `data` 属性获取数据。**

#### 原因

`PureHttp` 在响应拦截器中已经自动提取 `response.data`，直接返回业务数据。因此：

- ✅ **正确**：`res.success`、`res.message`、`res.data`
- ❌ **错误**：`res.data.success`、`res.data.message`

#### 实现原理

在 [http/index.ts](file:///d:\projects\oops-ai\frontend/src/utils/http/index.ts#L117-136) 中，响应拦截器已经处理了 `response.data`：

```typescript
instance.interceptors.response.use(
  (response: PureHttpResponse) => {
    // ...
    return response.data; // 直接返回 response.data
  },
  // ...
);
```

#### 正确示例

```typescript
const res = await testLLMConnection(currentConfig.value.id);
testResult.value = {
  success: res.success, // ✅ 直接使用
  message: res.message, // ✅ 直接使用
};

// 列表数据
const res = await getList(params);
listData.value = res.data; // ✅ res 已经是 data
total.value = res.total; // ✅ 直接使用
```

#### 禁止的行为

```typescript
// ❌ 错误示例 - 多余的 data 属性
const res = await testLLMConnection(id);
const { success } = res.data; // ❌ 不需要 res.data

// ❌ 错误示例 - 错误的嵌套
testResult.value = {
  success: res.data.success, // ❌ 错误
  message: res.data.message, // ❌ 错误
};
```
### 路由导航规范

#### 强制规则：使用命名路由导航

**所有路由导航必须使用 `router.push({ name: '路由名称' })` 方式，禁止直接使用 URL 字符串进行导航。**

#### 原因

1. **维护性**：路由名称与 URL 解耦，URL 变更时无需修改所有导航代码
2. **类型安全**：配合 TypeScript 可在编译时检查路由名称合法性
3. **可读性**：通过路由名称能直观了解导航目标，无需记忆 URL 结构

#### 正确示例
