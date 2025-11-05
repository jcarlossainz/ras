'use client'
  import { useToast } from '@/hooks/useToast'
  import { useConfirm } from '@/components/ui/confirm-modal'
  
  export default function TestPage() {
    const toast = useToast()
    const confirm = useConfirm()
    
    return (
      <div className="p-8 space-y-4">
        <button onClick={() => toast.success('¡Funciona!')}>
          Test Success
        </button>
        <button onClick={async () => {
          const ok = await confirm.danger('¿Seguro?')
          toast.info(ok ? 'Sí' : 'No')
        }}>
          Test Confirm
        </button>
      </div>
    )
  }