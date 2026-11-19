import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'BI_MAT_CUA_NHOM', // Khớp với khóa bí mật bên Auth Service
    });
  }

  async validate(payload: any) {
    return { username: payload.username, role: payload.role };
  }
}