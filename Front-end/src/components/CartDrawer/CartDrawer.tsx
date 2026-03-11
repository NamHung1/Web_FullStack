import { Drawer, List, Button } from "antd"

import { useCart } from "../../hooks/useCart"

interface Props {

  open: boolean

  onClose: () => void

}

export default function CartDrawer({ open, onClose }: Props) {

  const { items, remove } = useCart()

  return (

    <Drawer
      open={open}
      onClose={onClose}
      title="Your Cart"
    >

      <List

        dataSource={items}

        renderItem={(item) => (

          <List.Item>

            {item.product.name}

            <Button
              danger
              onClick={() => remove(item.product._id)}
            >

              Remove

            </Button>

          </List.Item>

        )}

      />

    </Drawer>

  )
}