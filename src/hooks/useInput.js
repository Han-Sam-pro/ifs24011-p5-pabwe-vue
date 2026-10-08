import { reactive, ref } from 'vue';

/**
 * Composable input reusable: two-way binding (`input.value`, dipakai dengan v-model
 * atau :value) dan penanganan perubahan nilai dari event input.
 */
export function useInput(initialValue = '') {
  const value = ref(initialValue);

  function onChange(event) {
    value.value = event && event.target ? event.target.value : event;
  }

  function reset(nextValue = initialValue) {
    value.value = nextValue;
  }

  // reactive() membuka ref secara otomatis, sehingga `input.value` berupa string.
  return reactive({ value, onChange, reset });
}

export default useInput;
