import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderItemDto, UpdateOrderItemDto } from './dto/order.dto';

@ApiTags('Order Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('order_items')
export class OrderItemsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả mặt hàng trong đơn hàng' })
  findAll() {
    return this.ordersService.findAllItems();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một mặt hàng' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOneItem(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mặt hàng mới' })
  create(@Body() dto: CreateOrderItemDto) {
    return this.ordersService.createItem(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật mặt hàng' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateItem(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một mặt hàng trong đơn hàng' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.removeItem(id);
  }
}