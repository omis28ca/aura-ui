<script setup>
import avatar from '@/assets/images/logo_sm.png'

const itemsCount = 42
</script>

<template>
  <CDropdown placement="bottom-end" variant="nav-item">
    <CDropdownToggle class="py-0 pe-0" :caret="false">
      <CAvatar :src="avatar" size="md" />
    </CDropdownToggle>
    <CDropdownMenu class="pt-0">
      <CDropdownHeader
        component="h6"
        class="bg-body-secondary text-body-secondary fw-semibold mb-2 "
      >
        Power
      </CDropdownHeader>
      <CDropdownItem> <CIcon icon="cil-lock-locked" /> Lock </CDropdownItem>
      <CDropdownDivider />
      <CDropdownItem> <CIcon icon="cil-input-power" /> Power Down </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>

