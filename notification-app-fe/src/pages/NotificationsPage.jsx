import { useState, useEffect } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
    Pagination,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import Log from "../lib/logger";

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const {
    notifications,
    totalPages,
    loading,
    error,
    unreadCount,
    viewedIds,
    markAsViewed,
  } = useNotifications({ filter, page });

  // log page load once
  useEffect(() => {
    Log("backend", "info", "page", "Notifications page loaded");
  }, []);

  function handleFilterChange(newFilter) {
    Log("backend", "info", "page", `Filter changed: ${newFilter}`);
    setFilter(newFilter);
    setPage(1); // reset to first page on filter change
  }

  function handlePageChange(_, newPage) {
    // guard invalid page numbers
    if (newPage < 1 || newPage > totalPages) return;
    Log("backend", "info", "page", `Pagination changed: page ${newPage}`);
    setPage(newPage);
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#eef2ff 0%,#f8fafc 50%,#ffffff 100%)",
        py: 5,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg,#2563eb,#4f46e5)",
            color: "white",
            boxShadow: "0 20px 40px rgba(37,99,235,.25)",
            mb: 4,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ fontSize: 36 }} />
              </Badge>

              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Notifications
                </Typography>

                <Typography sx={{ opacity: 0.85 }}>
                  Stay updated with your latest activity
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                px: 3,
                py: 1,
                bgcolor: "rgba(255,255,255,.15)",
                borderRadius: 3,
              }}
            >
              <Typography variant="h6">{unreadCount}</Typography>

              <Typography variant="body2">Unread</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Filter */}
        <Box
          sx={{
            bgcolor: "white",
            p: 2,
            borderRadius: 3,
            boxShadow: "0 8px 25px rgba(0,0,0,.08)",
            mb: 3,
          }}
        >
          <NotificationFilter value={filter} onChange={handleFilterChange} />
        </Box>

        {/* Loading */}
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 10,
            }}
          >
            <CircularProgress size={45} />
          </Box>
        )}

        {/* Error */}
        {!loading && error && (
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            Failed to load notifications
          </Alert>
        )}

        {/* Empty */}
        {!loading && !error && notifications.length === 0 && (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No notifications available.
          </Alert>
        )}

        {/* Cards */}
        {!loading && !error && notifications.length > 0 && (
          <Stack spacing={2}>
            {notifications.map((n) => (
              <Box
                key={n.ID}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "white",
                  boxShadow: "0 8px 30px rgba(0,0,0,.08)",
                  transition: ".3s",

                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 15px 40px rgba(0,0,0,.12)",
                  },
                }}
              >
                <NotificationCard
                  notification={n}
                  viewed={viewedIds.has(n.ID)}
                  onView={() => markAsViewed(n.ID)}
                />
              </Box>
            ))}
          </Stack>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Box
            sx={{
              mt: 5,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Pagination
              page={page}
              count={totalPages}
              onChange={handlePageChange}
              shape="rounded"
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
