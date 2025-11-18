# StockTech Design Guidelines

## Design Approach
**Selected System**: Material Design 3 with enterprise dashboard adaptations
**Rationale**: StockTech requires a data-dense, utility-focused interface prioritizing efficiency, clarity, and rapid information processing. Material Design provides robust patterns for tables, forms, alerts, and data visualization while maintaining professional credibility.

**Design Principles**:
- Information hierarchy: Critical alerts and stock levels immediately visible
- Efficient workflows: Minimize clicks for common operations
- Data clarity: Tables and charts optimized for quick scanning
- Visual feedback: Clear states for alerts, success, and errors

---

## Typography System

**Font Family**: Inter (Google Fonts) for excellent readability at small sizes
- Primary: Inter (400, 500, 600, 700)
- Monospace: JetBrains Mono for SKU/codes

**Hierarchy**:
- Page Headers: text-3xl font-bold
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-semibold
- Body Text: text-base font-normal
- Table Headers: text-sm font-medium uppercase tracking-wide
- Table Data: text-sm font-normal
- Labels: text-sm font-medium
- Helper Text: text-xs
- Alert Text: text-sm font-medium
- Stats/Metrics: text-2xl font-bold (numbers)

---

## Layout System

**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16 (consistent rhythm)
- Component padding: p-6
- Card spacing: space-y-4
- Section margins: mb-8
- Table cell padding: px-4 py-3
- Form field spacing: space-y-6

**Grid Structure**:
- Dashboard: 12-column responsive grid
- Stats cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Main content: max-w-7xl mx-auto with px-4 sm:px-6 lg:px-8
- Two-column forms: grid-cols-1 md:grid-cols-2 gap-6

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header with StockTech logo/branding (left)
- Main navigation links (Produtos, Movimentações, Relatórios, Configurações)
- User profile and notifications icon (right)
- Height: h-16 with shadow-md

**Sidebar** (for larger screens):
- w-64 fixed sidebar with navigation items
- Active state with border-l-4 indicator
- Icons from Heroicons (outline style)
- Collapsible on tablet/mobile

### Dashboard Components

**Stats Cards** (4 across desktop):
- Total Produtos
- Produtos em Alerta (prominent warning indicator)
- Entradas Hoje
- Saídas Hoje
- Each card: rounded-lg with shadow, p-6
- Large metric number with label below
- Trend indicator icon

**Alert Panel**:
- Prominent placement below stats
- List of products below minimum stock
- Each alert: flex layout with product name, current/minimum stock, severity indicator
- Sortable by severity/stock level
- Quick action button for restock

**Recent Movements Table**:
- Responsive table with sticky header
- Columns: Data/Hora, Produto, Tipo (Entrada/Saída), Quantidade, Responsável, Ações
- Alternating row treatment for readability
- Badge for movement type (distinct visual for entrada vs saída)
- Pagination controls at bottom

### Product Management

**Product List View**:
- Search bar with filter dropdown (by category, status)
- Table with columns: SKU, Nome, Descrição, Estoque Atual, Estoque Mínimo, Status, Ações
- Status badge (Normal, Alerta, Crítico)
- Action buttons: Edit, View History
- Add Product button (prominent, top-right)

**Product Form** (Add/Edit):
- Two-column layout for desktop
- Fields: Nome, SKU, Descrição, Categoria, Estoque Atual, Estoque Mínimo, Unidade de Medida
- Clear field labels with required indicators
- Help text below complex fields
- Action buttons: Salvar (primary), Cancelar (secondary)

### Movement Registration

**Quick Movement Form**:
- Compact card for rapid entry
- Product search/select (autocomplete)
- Type selector: Entrada/Saída (radio buttons with distinct visual)
- Quantidade (number input)
- Responsável (auto-filled from logged user, editable)
- Observações (optional textarea)
- Submit button changes based on type

### History View

**Filter Panel**:
- Date range picker
- Product filter (autocomplete)
- Movement type filter (checkboxes)
- Responsável filter
- Apply/Clear buttons

**History Table**:
- Comprehensive columns: Data, Hora, Produto, SKU, Tipo, Quantidade, Estoque Anterior, Estoque Novo, Responsável, Observações
- Export to CSV button
- Detail expand for observations

---

## Forms & Inputs

**Standard Input**:
- Border treatment with focus state
- Label above input (text-sm font-medium)
- Error state with message below
- Disabled state clearly distinguished

**Buttons**:
- Primary: px-6 py-2.5 rounded-lg font-medium
- Secondary: outline variant
- Danger: for destructive actions
- Icon buttons: p-2 rounded-lg for table actions

**Search/Filter**:
- Rounded search input with icon
- Dropdown filters with checkboxes
- Clear filters option

---

## Data Visualization

**Stock Level Indicators**:
- Progress bars showing current vs minimum
- Visual threshold markers
- Number display alongside bar

**Alert Badges**:
- Normal, Alerta (warning level), Crítico (danger level)
- Rounded-full px-3 py-1 text-xs font-semibold

**Charts** (if implementing):
- Use Chart.js library
- Bar chart for movement history
- Line chart for stock trends

---

## Icons
**Library**: Heroicons via CDN (outline style primarily, solid for active states)
- Dashboard: ChartBarIcon
- Products: CubeIcon
- Movements: ArrowsRightLeftIcon
- Alerts: ExclamationTriangleIcon
- Add: PlusIcon
- Edit: PencilIcon
- Search: MagnifyingGlassIcon

---

## Responsive Behavior
- Mobile: Stack all columns, collapsible sidebar, simplified tables (hide secondary columns)
- Tablet: 2-column layouts, partial sidebar
- Desktop: Full multi-column layouts, expanded tables

---

## Animations
Use sparingly, only for:
- Alert pulse for critical stock levels (subtle)
- Smooth transitions for dropdown/modal open/close
- Loading spinners for data fetch