import { Body, Controller, Post } from '@nestjs/common'
import { writeFileSync, appendFileSync, mkdirSync } from 'fs'
import { join } from 'path'

@Controller('debug')
export class DebugController {
  @Post('log')
  log(@Body() body: { msg?: string }) {
    if (!process.env.DEBUG_MOBILE_LOG) {
      return { ok: true, skipped: true }
    }
    try {
      const dir = join(process.cwd(), '.debug')
      mkdirSync(dir, { recursive: true })
      const file = join(dir, 'mobile.log')
      const line = `[${new Date().toISOString()}] ${(body?.msg ?? '').slice(0, 2000)}\n`
      if (require.main) {
        try {
          appendFileSync(file, line)
        } catch {
          writeFileSync(file, line)
        }
      }
    } catch {
      /* no-op */
    }
    return { ok: true }
  }
}
