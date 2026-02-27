# Guia de Acessibilidade - PayWinApp

## Princípios

PayWinApp foi desenvolvido seguindo os princípios **WCAG 2.1 nível AA**, garantindo que a aplicação seja utilizável por pessoas com diferentes capacidades.

## Componentes Acessíveis Cruciais

### 1. **Button Component** (Botões e Ações)

**Atributos ARIA obrigatórios:**
```tsx
<button
  aria-label="Adicionar nova transação"
  aria-describedby="transaction-help"
  type="button"
>
  <PlusIcon aria-hidden="true" />
  Adicionar
</button>
```

**Implementação:**
- `aria-label`: Descrição clara da ação
- `aria-describedby`: Referência a texto de ajuda
- `aria-hidden="true"` em ícones decorativos
- `type` explícito (button/submit)
- Estados: `:focus-visible`, `:hover`, `:active`
- Contraste mínimo: 4.5:1

**Estados dinâmicos:**
```tsx
<button
  aria-pressed={isActive}
  aria-busy={isLoading}
  disabled={isDisabled}
>
  {isLoading ? <Spinner aria-hidden="true" /> : 'Salvar'}
</button>
```

### 2. **FormField Component** (Campos de Formulário)

**Atributos ARIA obrigatórios:**
```tsx
<div>
  <label htmlFor="amount" id="amount-label">
    Valor da transação
  </label>
  <input
    id="amount"
    type="number"
    aria-labelledby="amount-label"
    aria-describedby="amount-error amount-help"
    aria-invalid={hasError}
    aria-required={true}
    autoComplete="off"
  />
  <span id="amount-help" className="sr-only">
    Digite o valor em reais
  </span>
  {hasError && (
    <span id="amount-error" role="alert" aria-live="polite">
      Valor deve ser maior que zero
    </span>
  )}
</div>
```

**Implementação:**
- `id` único e descritivo
- `label` sempre associado com `htmlFor`
- `aria-invalid` para estados de erro
- `aria-required` para campos obrigatórios
- `role="alert"` para mensagens de erro
- `aria-live="polite"` para atualizações dinâmicas

### 3. **DataTable Component** (Tabelas de Dados)

**Atributos ARIA obrigatórios:**
```tsx
<table
  role="table"
  aria-label="Transações recentes"
  aria-describedby="table-description"
>
  <caption id="table-description" className="sr-only">
    Lista das suas últimas 20 transações financeiras
  </caption>
  <thead>
    <tr role="row">
      <th scope="col" aria-sort="descending">
        Data
      </th>
      <th scope="col">Descrição</th>
      <th scope="col" className="numeric">
        Valor
      </th>
      <th scope="col">Ações</th>
    </tr>
  </thead>
  <tbody>
    <tr role="row">
      <td role="cell">27/02/2026</td>
      <td role="cell">Supermercado</td>
      <td role="cell" className="numeric">R$ 150,00</td>
      <td role="cell">
        <button aria-label="Editar transação Supermercado">
          Editar
        </button>
      </td>
    </tr>
  </tbody>
</table>
```

**Implementação:**
- `caption` descrevendo o conteúdo
- `scope="col"` para headers de coluna
- `scope="row"` para headers de linha
- `aria-sort` indicando ordenação
- Labels contextuais em botões de ação
- Classes semânticas (`.numeric` para alinhamento)

### 4. **Modal/Dialog Component**

**Atributos ARIA obrigatórios:**
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  tabIndex={-1}
>
  <div className="modal-content">
    <h2 id="modal-title">Confirmar exclusão</h2>
    <p id="modal-description">
      Você tem certeza que deseja excluir esta transação?
      Esta ação não pode ser desfeita.
    </p>
    
    <div role="group" aria-label="Ações do diálogo">
      <button onClick={onCancel} autoFocus>
        Cancelar
      </button>
      <button onClick={onConfirm} aria-describedby="delete-warning">
        Excluir
      </button>
    </div>
  </div>
</div>
```

**Implementação:**
- `role="dialog"` e `aria-modal="true"`
- `aria-labelledby` apontando para o título
- `aria-describedby` apontando para descrição
- Foco automático ao abrir
- Trap de foco (Tab não sai do modal)
- Fechar com ESC (`onKeyDown`)
- `autoFocus` no botão principal

### 5. **Chart Component** (Gráficos)

**Atributos ARIA obrigatórios:**
```tsx
<div
  role="img"
  aria-label="Gráfico de pizza mostrando despesas por categoria"
  aria-describedby="chart-details"
>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      {/* Configuração do gráfico */}
    </PieChart>
  </ResponsiveContainer>
  
  <div id="chart-details" className="sr-only">
    <h3>Detalhes do gráfico</h3>
    <ul>
      <li>Alimentação: R$ 800,00 (40%)</li>
      <li>Transporte: R$ 400,00 (20%)</li>
      <li>Moradia: R$ 600,00 (30%)</li>
      <li>Outros: R$ 200,00 (10%)</li>
    </ul>
  </div>
  
  {/* Tabela alternativa visível */}
  <table aria-label="Dados do gráfico em formato de tabela">
    <caption>Despesas por categoria</caption>
    {/* Mesmos dados em formato tabular */}
  </table>
</div>
```

**Implementação:**
- `role="img"` para o container do gráfico
- `aria-label` descritivo
- Alternativa textual (`sr-only`)
- Tabela visível como alternativa
- Cores com padrões/texturas (não só cor)
- Contraste adequado

## Navegação por Teclado

### Atalhos Globais
- `Tab`: Próximo elemento focável
- `Shift + Tab`: Elemento anterior
- `Enter`: Ativar botão/link
- `Space`: Ativar botão/checkbox
- `Esc`: Fechar modal/dropdown
- `Arrow keys`: Navegação em listas/menus

### Skip Links
```tsx
<a href="#main-content" className="skip-to-main">
  Pular para o conteúdo principal
</a>
```

**Estilo:**
```css
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-primary);
  color: white;
  padding: 8px 16px;
}

.skip-to-main:focus {
  top: 0;
}
```

## Contraste de Cores

### Padrões Mínimos (WCAG AA)
- **Texto normal**: 4.5:1
- **Texto grande**: 3:1
- **Componentes UI**: 3:1
- **Gráficos**: 3:1

### Palette Acessível
```css
/* Cores primárias */
--primary-600: #2563eb;      /* Ratio: 4.54:1 (✓ AA) */
--primary-700: #1d4ed8;      /* Ratio: 6.23:1 (✓ AAA) */

/* Cores de sucesso */
--success-600: #16a34a;      /* Ratio: 3.82:1 (✓ AA Large) */
--success-700: #15803d;      /* Ratio: 5.24:1 (✓ AA) */

/* Cores de erro */
--danger-600: #dc2626;       /* Ratio: 5.14:1 (✓ AA) */
--danger-700: #b91c1c;       /* Ratio: 6.89:1 (✓ AAA) */
```

## Screen Readers

### Landmarks ARIA
```tsx
<header role="banner">
  <nav role="navigation" aria-label="Navegação principal">
    {/* Menu */}
  </nav>
</header>

<main id="main-content" role="main">
  {/* Conteúdo principal */}
</main>

<aside role="complementary" aria-label="Informações adicionais">
  {/* Sidebar */}
</aside>

<footer role="contentinfo">
  {/* Rodapé */}
</footer>
```

### Live Regions
```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  Transação salva com sucesso!
</div>

<div role="alert" aria-live="assertive" aria-atomic="true">
  Erro: Valor inválido
</div>
```

## Testes de Acessibilidade

### Ferramentas
1. **axe DevTools** (browser extension)
2. **Lighthouse** (Chrome DevTools)
3. **NVDA** (screen reader - Windows)
4. **VoiceOver** (screen reader - macOS)
5. **WAVE** (web accessibility evaluator)

### Checklist Manual
- [ ] Navegação completa apenas com teclado
- [ ] Foco visível em todos os elementos interativos
- [ ] Textos alternativos em imagens
- [ ] Labels em todos os form fields
- [ ] Estrutura de headings lógica (h1 > h2 > h3)
- [ ] Contraste de cores adequado
- [ ] Sem flickering/piscando rápido
- [ ] Mensagens de erro claras
- [ ] Tempo suficiente para interações
- [ ] Conteúdo responsivo (zoom 200%)

## Documentação para Desenvolvedores

### Componente Acessível Exemplo
```tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
  'aria-label': string; // Obrigatório
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ children, variant = 'primary', isLoading, icon, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'btn',
          `btn-${variant}`,
          className
        )}
        aria-busy={isLoading}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        {children}
        {isLoading && (
          <>
            <span className="sr-only">Carregando...</span>
            <span aria-hidden="true" className="spinner" />
          </>
        )}
      </button>
    );
  }
);
```

## Recursos

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
