const useWindowResize = (callback, item) => {
  onMounted(() => {
    new ResizeObserver(callback).observe(item.value);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", callback);
  });
};

export default useWindowResize;
