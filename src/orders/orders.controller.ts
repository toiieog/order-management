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
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả các đơn hàng' })
  findAll() {
    return this.ordersService.findAllOrders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một đơn hàng' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOneOrder(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo đơn hàng mới (có kiểm tra tồn kho từ Product Service)' })
  create(
    @Body() dto: CreateOrderDto,
    @Headers('authorization') authHeader: string,
  ) {
    return this.ordersService.createOrder(dto, authHeader);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một đơn hàng' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.removeOrder(id);
  }
}