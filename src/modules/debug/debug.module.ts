import { Module } from '@nestjs/common';
import { DebugController } from '@/modules/debug/debug.controller';

@Module({
  imports: [],
  controllers: [DebugController],
  providers: [],
  exports: [],
})
export class DebugModule {}
