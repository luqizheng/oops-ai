import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = registerDto

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new ConflictException('Email already exists')
    }

    // Get default user role
    const userRole = await this.prisma.role.findUnique({ where: { name: 'user' } })
    if (!userRole) {
      throw new UnauthorizedException('Default role not found')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: userRole.id,
      },
      include: {
        role: true,
      },
    })

    // Generate JWT token
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    })

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto

    // Find user with role
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    })
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // Generate JWT token
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    })

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    }
  }

  /**
   * Get async routes based on user role
   */
  async getAsyncRoutes(userRole: string) {
    // Define all possible routes
    const allRoutes = [
      {
        path: '/permission',
        meta: {
          title: '权限管理',
          icon: 'ep:lollipop',
          rank: 10,
        },
        children: [
          {
            path: '/permission/page/index',
            name: 'PermissionPage',
            meta: {
              title: '页面权限',
              roles: ['admin', 'common'],
            },
          },
          {
            path: '/permission/button',
            meta: {
              title: '按钮权限',
              roles: ['admin', 'common'],
            },
            children: [
              {
                path: '/permission/button/router',
                component: 'permission/button/index',
                name: 'PermissionButtonRouter',
                meta: {
                  title: '路由返回按钮权限',
                  auths: ['permission:btn:add', 'permission:btn:edit', 'permission:btn:delete'],
                },
              },
              {
                path: '/permission/button/login',
                component: 'permission/button/perms',
                name: 'PermissionButtonLogin',
                meta: {
                  title: '登录接口返回按钮权限',
                },
              },
            ],
          },
        ],
      },
      {
        path: '/projects',
        meta: {
          title: '项目管理',
          icon: 'ep:folder-opened',
          rank: 15,
        },
        children: [
          {
            path: '/projects/management',
            component: 'projects/management/index',
            name: 'ProjectManagement',
            meta: {
              title: '项目列表',
              roles: ['admin', 'common'],
            },
          },
          {
            path: '/projects/create',
            component: 'projects/form/index',
            name: 'ProjectCreate',
            meta: {
              title: '创建项目',
              roles: ['admin'],
            },
          },
        ],
      },
      {
        path: '/requirements',
        meta: {
          title: '需求管理',
          icon: 'ep:document',
          rank: 20,
        },
        children: [
          {
            path: '/requirements/management',
            component: 'requirements/management/index',
            name: 'RequirementManagement',
            meta: {
              title: '需求列表',
              roles: ['admin', 'common'],
            },
          },
          {
            path: '/requirements/create',
            component: 'requirements/form/index',
            name: 'RequirementCreate',
            meta: {
              title: '创建需求',
              roles: ['admin', 'common'],
            },
          },
          {
            path: '/requirements/analysis',
            component: 'requirements/analysis/index',
            name: 'RequirementAnalysis',
            meta: {
              title: '需求分析',
              roles: ['admin', 'common'],
            },
          },
        ],
      },
      {
        path: '/llm',
        meta: {
          title: 'LLM配置',
          icon: 'ep:chat-line-round',
          rank: 25,
        },
        children: [
          {
            path: '/llm/configuration',
            component: 'llm/configuration/index',
            name: 'LLMConfiguration',
            meta: {
              title: '模型配置',
              roles: ['admin'],
            },
          },
        ],
      },
      {
        path: '/users',
        meta: {
          title: '用户管理',
          icon: 'ep:user',
          rank: 30,
        },
        children: [
          {
            path: '/users/management',
            component: 'users/management/index',
            name: 'UserManagement',
            meta: {
              title: '用户列表',
              roles: ['admin'],
            },
          },
        ],
      },
    ]

    // Filter routes based on user role
    const filterRoutesByRole = (routes: any[]) => {
      return routes.filter((route) => {
        // If route has no roles specified, it's accessible to all
        if (!route.meta?.roles) {
          // Check children if any
          if (route.children && route.children.length > 0) {
            route.children = filterRoutesByRole(route.children)
            // Keep the route if it has accessible children
            return route.children.length > 0
          }
          return true
        }

        // Check if user role has access to this route
        if (route.meta.roles.includes(userRole)) {
          // Check children if any
          if (route.children && route.children.length > 0) {
            route.children = filterRoutesByRole(route.children)
          }
          return true
        }

        return false
      })
    }

    return filterRoutesByRole(allRoutes)
  }
}
