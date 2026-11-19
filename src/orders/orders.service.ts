import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OrderEntity } from './order.entity';
import { OrderItemEntity } from './order-item.entity';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  CreateOrderItemDto,
  UpdateOrderItemDto,
} from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly itemRepo: Repository<OrderItemEntity>,
    private readonly httpService: HttpService,
  ) {}

  // ================= QUẢN LÝ ĐƠN HÀNG (ORDERS) =================

  async findAllOrders() {
    return await this.orderRepo.find({ relations: { items: true } });
  }

  async findOneOrder(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { items: true },
    });
    if (!order) throw new NotFoundException(`Không tìm thấy đơn hàng ID = ${id}`);
    return order;
  }

  async createOrder(dto: CreateOrderDto, authHeader: string) {
    let totalAmount = 0;
    const validatedItems: Partial<OrderItemEntity>[] = [];

    // 1. Gọi sang Product Service (cổng 3001) kiểm tra tồn kho từng sản phẩm
    for (const item of dto.items) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(`http://localhost:3001/products/${item.product_id}`, {
            headers: { Authorization: authHeader },
          }),
        );
        const product = response.data;

        if (product.quantity < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm "${product.name}" chỉ còn ${product.quantity} cái, không đủ số lượng ${item.quantity}!`,
          );
        }

        const itemTotal = Number(product.price) * item.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity: item.quantity,
          unit_price: Number(product.price),
          total_price: itemTotal,
        });
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException(
          `Không thể kiểm tra sản phẩm ID = ${item.product_id} từ Product Service (3001). Hãy đảm bảo Product Service đang chạy!`,
        );
      }
    }

    // 2. Lưu thông tin đơn hàng vào bảng orders
    const newOrder = this.orderRepo.create({
      customer_name: dto.customer_name,
      customer_email: dto.customer_email,
      total_amount: totalAmount,
      status: 'pending',
    });
    const savedOrder = await this.orderRepo.save(newOrder);

    // 3. Lưu chi tiết đơn hàng vào bảng order_items
    for (const vItem of validatedItems) {
      const orderItem = this.itemRepo.create({
        ...vItem,
        order_id: savedOrder.id,
      });
      await this.itemRepo.save(orderItem);
    }

    return this.findOneOrder(savedOrder.id);
  }

  async updateOrderStatus(id: number, dto: UpdateOrderStatusDto) {
    const order = await this.findOneOrder(id);
    order.status = dto.status;
    return await this.orderRepo.save(order);
  }

  async removeOrder(id: number) {
    const order = await this.findOneOrder(id);
    await this.orderRepo.remove(order);
    return { message: `Đã xóa đơn hàng ID = ${id}` };
  }

  // ================= QUẢN LÝ CHI TIẾT ĐƠN HÀNG (ORDER_ITEMS) =================

  async findAllItems() {
    return await this.itemRepo.find();
  }

  async findOneItem(id: number) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Không tìm thấy chi tiết đơn hàng ID = ${id}`);
    return item;
  }

  async createItem(dto: CreateOrderItemDto) {
    await this.findOneOrder(dto.order_id); // Kiểm tra order_id có tồn tại không
    const total_price = dto.quantity * dto.unit_price;
    const newItem = this.itemRepo.create({
      ...dto,
      total_price,
    });
    return await this.itemRepo.save(newItem);
  }

  async updateItem(id: number, dto: UpdateOrderItemDto) {
    const item = await this.findOneItem(id);
    if (dto.quantity !== undefined) item.quantity = dto.quantity;
    if (dto.unit_price !== undefined) item.unit_price = dto.unit_price;
    item.total_price = item.quantity * Number(item.unit_price);
    return await this.itemRepo.save(item);
  }

  async removeItem(id: number) {
    const item = await this.findOneItem(id);
    await this.itemRepo.remove(item);
    return { message: `Đã xóa mặt hàng ID = ${id}` };
  }
}