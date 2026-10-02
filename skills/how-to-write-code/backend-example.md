# Canonical Backend Example

```ts
import {
  EMPTY_ITEM_COUNT,
  FULFILLED_ORDER_STATUS,
  ORDER_FULFILLED_EVENT,
  PAID_ORDER_STATUS,
} from "./constants";
import {
  FulfillOrderDependencies,
  FulfillOrderInput,
  InventoryReservation,
  Order,
} from "./types";

export class OrderFulfillmentService {
  constructor(
    private readonly dependencies: FulfillOrderDependencies,
  ) {}

  async fulfill(input: FulfillOrderInput): Promise<Order> {
    const order = await this.loadOrder(input.orderId);

    this.validateOrder(order);

    const reservations = await this.reserveInventory(order);
    const shipment = await this.dependencies.shipments.create({
      orderId: order.id,
      customerId: order.customerId,
      address: order.shippingAddress,
      reservations,
    });

    return this.completeFulfillment(order, shipment.id);
  }

  private async loadOrder(orderId: string): Promise<Order> {
    const order = await this.dependencies.orders.findById(orderId);

    if (!order) {
      const errorMessage = `Order ${orderId} was not found`;
      this.dependencies.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return order;
  }

  private validateOrder(order: Order): void {
    if (order.status !== PAID_ORDER_STATUS) {
      const errorMessage = `Order ${order.id} has not been paid`;
      this.dependencies.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (order.items.length === EMPTY_ITEM_COUNT) {
      const errorMessage = `Order ${order.id} has no items`;
      this.dependencies.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  private async reserveInventory(
    order: Order,
  ): Promise<InventoryReservation[]> {
    const reservations: InventoryReservation[] = [];

    for (const item of order.items) {
      const reservation = await this.dependencies.inventory.reserve({
        productId: item.productId,
        quantity: item.quantity,
      });

      reservations.push(reservation);
    }

    return reservations;
  }

  private async completeFulfillment(
    order: Order,
    shipmentId: string,
  ): Promise<Order> {
    const fulfilledOrder = await this.dependencies.orders.update(order.id, {
      status: FULFILLED_ORDER_STATUS,
      shipmentId,
    });

    await this.dependencies.events.publish({
      type: ORDER_FULFILLED_EVENT,
      orderId: order.id,
      shipmentId,
    });

    return fulfilledOrder;
  }
}
```
