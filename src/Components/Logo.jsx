function Logo({ width = '100px', className = '' }) {
  return (
    <img
      src="/logo.svg"
      alt="Vaibhav Notes"
      width="160"
      height="48"
      style={{ width, height: 'auto' }}
      className={className}
    />
  )
}

export default Logo
