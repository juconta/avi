import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { StorageModule } from '../storage/storage.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    StorageModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'avi_dev_secret_change_in_production',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '12h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
