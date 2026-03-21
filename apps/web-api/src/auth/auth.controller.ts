import { Controller, Post, Body, HttpCode, HttpStatus, Get, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { RegisterDto, LoginDto } from './dto/auth.dto'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logout successful' })
  async logout() {
    // For JWT authentication, we don't need to do anything on the server side
    // The client will handle removing the token from local storage
    return { message: 'Logout successful' }
  }

  @Get('/get-async-routes')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get async routes based on user role' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Async routes retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getAsyncRoutes(@Req() req) {
    const userRole = req.user.role
    const routes = await this.authService.getAsyncRoutes(userRole)
    return {
      success: true,
      data: routes,
    }
  }
}
