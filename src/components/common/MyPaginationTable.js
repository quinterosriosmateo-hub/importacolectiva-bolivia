import React, { useState, useMemo } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, TablePagination, TextField, InputAdornment, Paper,
  CircularProgress, Typography, IconButton, Tooltip, Collapse, Grid, alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import InfoIcon from '@mui/icons-material/Info';


/**
 * MyPaginationTable: Todo integrado en una sola tarjeta con bordes limpios y contorno definido.
 */
const MyPaginationTable = ({
  title,
  subtitle,
  TooltipTitle,
  columns,
  rows,
  loading,
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados",
  initialOrderBy = "",
  initialOrder = "asc",
  color = "primary" // Controla el color del contorno exterior y headers
}) => {
  const [order, setOrder] = useState(initialOrder);
  const [orderBy, setOrderBy] = useState(initialOrderBy);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterText, setFilterText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState({});

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleColumnFilterChange = (id, value) => {
    setColumnFilters(prev => ({ ...prev, [id]: value }));
    setPage(0);
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesGlobal = Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filterText.toLowerCase())
      );

      const matchesColumns = Object.entries(columnFilters).every(([id, val]) =>
        !val || (row[id]?.toString().toLowerCase().includes(val.toLowerCase()))
      );

      return matchesGlobal && matchesColumns;
    });
  }, [rows, filterText, columnFilters]);

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!orderBy) return 0;
    const valA = a[orderBy] || '';
    const valB = b[orderBy] || '';
    if (valB < valA) return order === 'desc' ? -1 : 1;
    if (valB > valA) return order === 'desc' ? 1 : -1;
    return 0;
  });

  const paginatedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. CONTENEDOR ÚNICO (Buscador + Filtros + Tabla juntos) */}
      {/* 3. BORDES NOTORIOS (Pintados con el color principal del tema) */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '6px',
          overflow: 'hidden',
          border: '2px solid', // Borde grueso y marcado
          borderColor: (theme) => alpha(theme.palette[color].main, 0.3), // Pintado con el color dinámico de la prop
          bgcolor: 'background.paper'
        }}
      >
        {title && (
          <Box display="flex" alignItems="center" gap={1} variant="h6" sx={{ mt: 2, fontWeight: 600, color: 'text.primary', px: 3 }}>
            {title} ({subtitle && ` - ${subtitle}`})
            {TooltipTitle && (
              <Tooltip title={TooltipTitle}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
        {/* BUSCADOR INTEGRADO */}
        <Box
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            bgcolor: 'background.paper',
            borderBottom: '0.1px solid', // Separa el buscador de la tabla con el mismo grosor
            borderColor: `${color}.main`
          }}
        >
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder={searchPlaceholder}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
              sx: {
                borderRadius: '10px',
                bgcolor: 'action.hover',
                '& fieldset': { border: 'none' } // Remueve el borde interno del input para máxima limpieza
              }
            }}
          />
          <Tooltip title={showFilters ? "Ocultar filtros" : "Filtros avanzados"}>
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? color : "default"}
              sx={{
                border: '1.5px solid',
                borderColor: showFilters ? `${color}.main` : 'divider',
                borderRadius: '10px',
                p: '8px'
              }}
            >
              {showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* FILTROS AVANZADOS COLAPSABLES */}
        <Collapse in={showFilters}>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '2px solid', borderColor: 'divider' }}>
            <Grid container spacing={2}>
              {columns.filter(c => c.sortable !== false && c.id !== 'actions').map(col => (
                <Grid item xs={12} sm={6} md={3} key={col.id}>
                  <TextField
                    fullWidth
                    size="small"
                    label={`Filtrar por ${col.label}`}
                    value={columnFilters[col.id] || ''}
                    onChange={(e) => handleColumnFilterChange(col.id, e.target.value)}
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: '8px', bgcolor: 'background.paper' } }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>

        {/* CONTENEDOR DE LA TABLA */}
        <TableContainer>
          {loading ? (
            <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}><CircularProgress color={color} /></Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: `${color}.main` }}>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align || 'left'}
                      sortDirection={orderBy === col.id ? order : false}
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        py: 2,
                        borderBottom: 'none' // 2. MENOS BORDES: Sin líneas divisorias debajo del header
                      }}
                    >
                      {col.sortable !== false ? (
                        <TableSortLabel
                          active={orderBy === col.id}
                          direction={orderBy === col.id ? order : 'asc'}
                          onClick={() => handleRequestSort(col.id)}
                          sx={{
                            color: 'white !important',
                            '& .MuiTableSortLabel-icon': { color: 'white !important' }
                          }}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                      <Typography color="text.secondary" variant="body2">{emptyMessage}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row, index) => (
                    <TableRow
                      key={row.id || index}
                      hover
                      sx={{
                        '&:nth-of-type(even)': { bgcolor: 'action.hover' },
                        transition: 'background-color 0.15s'
                      }}
                    >
                      {columns.map((col) => (
                        <TableCell
                          key={col.id}
                          align={col.align || 'left'}
                          sx={{
                            py: 1.8,
                            borderBottom: 'none' // 2. MENOS BORDES: Se eliminaron por completo las líneas entre filas
                          }}
                        >
                          {col.render ? col.render(row) : (row[col.id] || '—')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* PAGINACIÓN */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Items:"
          sx={{
            borderTop: '1.5px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        />
      </Paper>
    </Box>
  );
};

export default MyPaginationTable;