import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderProductInputDto {
  @ApiProperty({ example: 1, description: 'ID sản phẩm bên Product Service' })
  product_id: number;

  @ApiProperty({ example: 2, description: 'Số lượng đặt mua' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  customer_name: string;

  @ApiProperty({ example: 'nguyenvana@gmail.com' })
  customer_email: string;

  @ApiProperty({
    type: [OrderProductInputDto],
    description: 'Danh sách sản phẩm đặt mua để kiểm tra tồn kho',
  })
  items: OrderProductInputDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'completed',
    enum: ['pending', 'completed', 'cancelled'],
    description: 'Trạng thái đơn hàng',
  })
  status: string;
}

export class CreateOrderItemDto {
  @ApiProperty({ example: 1 })
  order_id: number;

  @ApiProperty({ example: 1 })
  product_id: number;

  @ApiProperty({ example: 'Laptop Dell XPS 15' })
  product_name: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 25000000 })
  unit_price: number;
}

export class UpdateOrderItemDto {
  @ApiPropertyOptional({ example: 3 })
  quantity?: number;

  @ApiPropertyOptional({ example: 25000000 })
  unit_price?: number;
}