import { useEffect } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

import { NotificationCard } from "../components/NotificationCard";
import { usePriorityNotifications } from "../hooks/usePriorityNotifications";
import Log from "../lib/logger";

export function PriorityNotificationsPage() {
  const { notifications, loading, error } = usePriorityNotifications(10);

  useEffect(() => {
    Log("backend", "info", "page", "Priority Notifications page loaded");
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%)",
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
            background: "linear-gradient(135deg,#f59e0b,#ea580c)",
            color: "white",
            boxShadow: "0 15px 40px rgba(245,158,11,.3)",
            mb: 4,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <StarIcon sx={{ fontSize: 42 }} />

              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Priority Notifications
                </Typography>

                <Typography sx={{ opacity: 0.9 }}>
                  Important alerts that require immediate attention
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                px: 3,
                py: 1,
                bgcolor: "rgba(255,255,255,.18)",
                borderRadius: 3,
              }}
            >
              <Typography variant="h5" fontWeight={700}>
                {notifications.length}
              </Typography>

              <Typography variant="body2">Top Alerts</Typography>
            </Box>
          </Stack>
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
            Failed to load priority notifications.
          </Alert>
        )}

        {/* Empty */}
        {!loading && !error && notifications.length === 0 && (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No priority notifications available.
          </Alert>
        )}

        {/* Cards */}
        {!loading && !error && notifications.length > 0 && (
          <Stack spacing={3}>
            {notifications.map((n, idx) => (
              <Box
                key={n.ID}
                sx={{
                  bgcolor: "white",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,.08)",
                  transition: ".3s",

                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 18px 40px rgba(0,0,0,.12)",
                  },
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor:
                      idx === 0 ? "#fef3c7" : idx === 1 ? "#fff7ed" : "#fafafa",
                  }}
                >
                  <Typography fontWeight={700} color="warning.main">
                    ⭐ Priority #{idx + 1}
                  </Typography>

                  {idx === 0 && (
                    <Typography
                      sx={{
                        px: 1.5,
                        py: 0.4,
                        bgcolor: "#ef4444",
                        color: "white",
                        borderRadius: 5,
                        fontSize: 12,
                      }}
                    >
                      Highest
                    </Typography>
                  )}
                </Box>

                <NotificationCard
                  notification={n}
                  viewed={false}
                  onView={() => {}}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
