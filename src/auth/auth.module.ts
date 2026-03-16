import {forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {UsersService} from "../users/users.service";
import {UsersModule} from "../users/users.module";
import { JwtModule } from '@nestjs/jwt';
import * as process from "node:process";

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
      forwardRef(() => UsersModule),
      JwtModule.register({
        secret: process.env.PRIVATE_KEY || 'SECRET',
        signOptions: {
          expiresIn: '1d',
        }
      })
  ], exports: [
      AuthService,
        JwtModule,
    ]

})
export class AuthModule {}
